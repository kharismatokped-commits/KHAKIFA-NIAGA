/**
 * Script untuk langsung mengimpor data produk dari `products_structured.json`
 * (480 produk hasil parsing POS) langsung ke Supabase PostgreSQL via Prisma.
 *
 * Cara pakai:
 *   node scripts/import-structured-json.js
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Peta nama kategori ramah pengguna berdasarkan kode jenis iPOS
const CATEGORY_NAMES = {
  ATK: 'Alat Tulis Kantor (ATK)',
  plastik: 'Plastik & Kemasan',
  RT: 'Kebutuhan Rumah Tangga',
  kelontong: 'Kelontong & Sembako',
  LT: 'Listrik & Perkakas',
  MNA: 'Mainan & Aksesoris',
  OLR: 'Olahraga & Hobi',
  AKS: 'Aksesoris & Lainnya',
};

const CATEGORY_ICONS = {
  ATK: 'BookOpen',
  plastik: 'Package',
  RT: 'Home',
  kelontong: 'Store',
  LT: 'Package',
  MNA: 'LayoutGrid',
  OLR: 'LayoutGrid',
  AKS: 'LayoutGrid',
};

async function main() {
  const jsonPath = path.resolve(__dirname, '../products_structured.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`File ${jsonPath} tidak ditemukan!`);
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, 'utf8');
  const productsMap = JSON.parse(raw);
  const totalProducts = Object.keys(productsMap).length;

  console.log(`Ditemukan ${totalProducts} produk di products_structured.json.`);
  console.log('Memulai import ke database Supabase...');

  let created = 0;

  for (const [name, rows] of Object.entries(productsMap)) {
    if (!rows || rows.length === 0) continue;

    const first = rows[0];
    const kodeJenis = first.jenis || 'LAINNYA';
    const kategoriNama = CATEGORY_NAMES[kodeJenis] || kodeJenis;
    const kategoriIkon = CATEGORY_ICONS[kodeJenis] || 'LayoutGrid';
    const deskripsi = first.keterangan || (first.merek ? `Merek: ${first.merek}` : null);

    // Cari atau buat kategori
    let category = await prisma.category.findFirst({
      where: { kodeAsal: kodeJenis },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          nama: kategoriNama,
          kodeAsal: kodeJenis,
          ikon: kategoriIkon,
        },
      });
    }

    // Upsert produk
    const product = await prisma.product.upsert({
      where: { nama: name },
      update: {
        deskripsi: deskripsi,
        categoryId: category.id,
      },
      create: {
        nama: name,
        deskripsi: deskripsi,
        categoryId: category.id,
      },
    });

    // Proses varian dan tier harga
    for (const item of rows) {
      const v = item.variant;
      if (!v) continue;

      const satuan = v.satuan || 'pcs';
      const konversi = v.konversi || 1;

      const variant = await prisma.productVariant.upsert({
        where: {
          productId_satuan: {
            productId: product.id,
            satuan: satuan,
          },
        },
        update: {
          konversi: konversi,
        },
        create: {
          productId: product.id,
          namaVarian: satuan.toUpperCase(),
          satuan: satuan,
          konversi: konversi,
        },
      });

      // Bersihkan tier lama dan isi tier baru
      if (v.tiers && v.tiers.length > 0) {
        await prisma.priceTier.deleteMany({
          where: { productVariantId: variant.id },
        });

        await prisma.priceTier.createMany({
          data: v.tiers.map((t) => ({
            productVariantId: variant.id,
            jenisKemasan: satuan,
            minQty: t.minQty,
            maxQty: t.maxQty,
            hargaPerUnit: Math.round(t.hargaPerUnit),
          })),
        });
      }
    }

    created++;
    if (created % 50 === 0 || created === totalProducts) {
      console.log(`Progress: ${created}/${totalProducts} produk terproses...`);
    }
  }

  console.log(`\nImport selesai! Total ${created} produk berhasil disimpan di database.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Error saat import:', e);
  await prisma.$disconnect();
  process.exit(1);
});
