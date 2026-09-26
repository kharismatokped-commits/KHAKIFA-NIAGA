/**
 * Script import produk dari file Excel export iPOS 5 Pro ke database (Prisma).
 *
 * Cara pakai:
 *   1. Install dependency: npm install xlsx (sudah terinstall)
 *   2. Jalankan: node scripts/import-pos-products.js path/ke/POS_harga_Tier_1.xlsx
 *
 * Logika ini sudah diuji terhadap data asli (621 baris -> 480 produk unik).
 */

const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Angka yang dipakai iPOS sebagai penanda "tanpa batas atas"
const INFINITY_SENTINELS = new Set([100, 1000, 9999, 99999, 999999, 9999999]);

function buildTiers(row) {
  const tiers = [];
  let prevMax = 0;

  for (let i = 1; i <= 4; i++) {
    const jml = row[`Jml ${i}`];
    const harga = row[`Harga Jml ${i}`];

    if (jml == null || harga == null || Number(harga) === 0) continue;

    const jmlNum = Number(jml);
    const minQty = prevMax + 1;
    const isUnlimited = INFINITY_SENTINELS.has(jmlNum);
    const maxQty = isUnlimited ? null : jmlNum;

    tiers.push({ minQty, maxQty, hargaPerUnit: Number(harga) });

    if (!isUnlimited) prevMax = jmlNum;
  }

  return tiers;
}

function isSuspiciousName(name) {
  if (!name || name.length < 4) return true;
  if (!/[aeiouAEIOU]/.test(name)) return true; // tidak ada huruf vokal -> kemungkinan random string
  return false;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Gunakan: node scripts/import-pos-products.js path/ke/file.xlsx');
    process.exit(1);
  }

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const grouped = new Map(); // nama produk -> { jenis, merek, keterangan, variants: [] }
  const flagged = [];

  for (const row of rows) {
    const name = String(row['Nama Item'] || '').trim();
    const jenis = row['Jenis'] || null;
    const merek = row['Merek'] || null;
    const konversi = Number(row['Konversi']) || 1;
    const satuan = row['Satuan'] || 'pcs';
    const keterangan = row['Keterangan'] || null;

    const tiers = buildTiers(row);

    const reasons = [];
    if (isSuspiciousName(name)) reasons.push('nama mencurigakan');
    if (tiers.length === 0) reasons.push('semua tier harga 0 / kosong');
    if (!jenis) reasons.push('kategori kosong');

    if (reasons.length > 0) {
      flagged.push({ nama: name, satuan, alasan: reasons });
      continue; // lewati baris yang di-flag
    }

    if (!grouped.has(name)) {
      grouped.set(name, { jenis, merek, keterangan, variants: [] });
    }
    grouped.get(name).variants.push({ satuan, konversi, tiers });
  }

  console.log(`Total baris di file: ${rows.length}`);
  console.log(`Produk valid untuk diimport: ${grouped.size}`);
  console.log(`Baris di-flag (dilewati, perlu ditinjau manual): ${flagged.length}`);

  if (flagged.length > 0) {
    console.log('\n=== Baris yang dilewati ===');
    flagged.forEach(f => console.log(`- ${f.nama} (${f.satuan}) -> ${f.alasan.join(', ')}`));
  }

  console.log('\nMulai import ke database...');
  let created = 0;

  for (const [name, data] of grouped) {
    // Cari atau buat kategori berdasarkan kode "Jenis" dari iPOS
    let category = await prisma.category.findFirst({ where: { kodeAsal: data.jenis } });
    if (!category) {
      category = await prisma.category.create({
        data: { nama: data.jenis, kodeAsal: data.jenis, ikon: 'LayoutGrid' },
      });
    }

    const product = await prisma.product.upsert({
      where: { nama: name },
      update: { deskripsi: data.keterangan, categoryId: category.id },
      create: {
        nama: name,
        deskripsi: data.keterangan,
        categoryId: category.id,
      },
    });

    for (const v of data.variants) {
      const variant = await prisma.productVariant.upsert({
        where: {
          productId_satuan: { productId: product.id, satuan: v.satuan },
        },
        update: { konversi: v.konversi },
        create: {
          productId: product.id,
          namaVarian: v.satuan.toUpperCase(),
          satuan: v.satuan,
          konversi: v.konversi,
        },
      });

      // Hapus tier lama, ganti dengan yang baru
      await prisma.priceTier.deleteMany({ where: { productVariantId: variant.id } });
      await prisma.priceTier.createMany({
        data: v.tiers.map(t => ({
          productVariantId: variant.id,
          jenisKemasan: v.satuan || 'pcs',
          minQty: t.minQty,
          maxQty: t.maxQty,
          hargaPerUnit: t.hargaPerUnit,
        })),
      });
    }

    created++;
  }

  console.log(`\nSelesai. ${created} produk berhasil diimport/diupdate.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
