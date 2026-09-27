const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');
const prisma = new PrismaClient();

const COLOR_MAP = {
  hitam: '#1E293B',
  biru: '#2563EB',
  merah: '#DC2626',
  hijau: '#16A34A',
  kuning: '#EAB308',
  putih: '#F8FAFC',
  coklat: '#78350F',
  cokelat: '#78350F',
  pink: '#EC4899',
  ungu: '#9333EA',
  orange: '#F97316',
  oranye: '#F97316',
  gold: '#D97706',
  silver: '#94A3B8',
  abu: '#64748B',
  pastel: '#F472B6',
  basic: '#3B82F6',
  metallic: '#EAB308',
  metalik: '#EAB308',
  neon: '#22C55E',
};

async function main() {
  const excelPath = '/Users/kharismabahtiar/Downloads/POS harga Tier 1.xlsx';
  console.log('Membaca file Excel dari:', excelPath);

  const wb = XLSX.readFile(excelPath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  console.log(`Total baris di Excel: ${rows.length}`);

  // 1. Kumpulkan data per Nama Item dari Excel
  // Buat lookup namaItem (case-insensitive trim) -> { items: [] }
  const posMap = new Map();
  for (const r of rows) {
    const name = (r['Nama Item'] || '').trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (!posMap.has(key)) {
      posMap.set(key, []);
    }
    posMap.get(key).push(r);
  }

  // 2. Ambil semua produk dari database
  const dbProducts = await prisma.product.findMany({
    include: {
      variants: {
        include: { priceTiers: true },
      },
    },
  });

  console.log(`Total produk di database: ${dbProducts.length}`);

  // 3. Update keterangan & satuanDefault untuk semua produk
  let updatedCount = 0;
  for (const p of dbProducts) {
    const key = p.nama.trim().toLowerCase();
    const posRows = posMap.get(key);

    let rawSatuan = 'pcs';
    let ket = null;

    if (posRows && posRows.length > 0) {
      const primaryRow = posRows[0];
      rawSatuan = (primaryRow.Satuan || 'pcs').toLowerCase().replace(/^-/, '');

      // Cari keterangan eksplisit
      const rowWithKet = posRows.find((r) => r.Keterangan && String(r.Keterangan).trim() !== '');
      if (rowWithKet) {
        ket = String(rowWithKet.Keterangan).trim();
      }

      // Jika belum ada keterangan tapi ada konversi kemasan (multi-row)
      if (!ket && posRows.length > 1) {
        const secondary = posRows.find((r) => r.Konversi && r.Konversi > 1);
        if (secondary) {
          const secUnit = (secondary.Satuan || 'pak').toLowerCase().replace(/^-/, '');
          ket = `1 ${secUnit} isi ${secondary.Konversi} ${rawSatuan}`;
        }
      }
    }

    if (!ket) {
      if (p.deskripsi && (p.deskripsi.toLowerCase().includes('isi') || p.deskripsi.toLowerCase().includes('warna'))) {
        ket = p.deskripsi;
      } else {
        ket = `Kemasan resmi ${rawSatuan}`;
      }
    }

    await prisma.product.update({
      where: { id: p.id },
      data: {
        satuanDefault: rawSatuan,
        keterangan: ket,
      },
    });
    updatedCount++;
  }

  console.log(`Berhasil sinkronisasi keterangan & satuanDefault untuk ${updatedCount} produk.`);

  // 4. Konfigurasi Varian Spesifik yang memiliki banyak varian (seperti di referensi Snowman & data POS)
  const MULTI_VARIANT_PRODUCTS = [
    {
      name: 'Pulpen Snowman',
      keterangan: '1 pak isi 12 pcs',
      satuanDefault: 'pak',
      categoryKode: 'ATK',
      variants: [
        { name: 'Hitam', colorHex: '#1E293B' },
        { name: 'Biru', colorHex: '#2563EB' },
        { name: 'Merah', colorHex: '#DC2626' },
        { name: 'Hijau', colorHex: '#16A34A' },
        { name: 'Ungu', colorHex: '#9333EA' },
        { name: 'Pink', colorHex: '#EC4899' },
        { name: 'Oranye', colorHex: '#F97316' },
        { name: 'Cokelat', colorHex: '#78350F' },
      ],
      tiers: [
        { minQty: 1, maxQty: 2, hargaPerUnit: 15000 },
        { minQty: 3, maxQty: 11, hargaPerUnit: 14000 },
        { minQty: 12, maxQty: null, hargaPerUnit: 13500 },
      ],
    },
    {
      name: 'Cat Snowman',
      keterangan: '1 pak isi 12 pcs',
      satuanDefault: 'pak',
      categoryKode: 'ATK',
      variants: [
        { name: 'Pastel', colorHex: '#F472B6' },
        { name: 'Basic', colorHex: '#3B82F6' },
        { name: 'Metallic', colorHex: '#EAB308' },
        { name: 'Neon', colorHex: '#22C55E' },
      ],
      tiers: [
        { minQty: 1, maxQty: 2, hargaPerUnit: 65000 },
        { minQty: 3, maxQty: 11, hargaPerUnit: 62000 },
        { minQty: 12, maxQty: null, hargaPerUnit: 58000 },
      ],
    },
    {
      name: 'Pulpen Faster F3',
      keterangan: '1 kotak isi 12 pcs',
      satuanDefault: 'ktk',
      categoryKode: 'ATK',
      variants: [
        { name: 'Hitam', colorHex: '#1E293B' },
        { name: 'Biru', colorHex: '#2563EB' },
        { name: 'Merah', colorHex: '#DC2626' },
        { name: 'Hijau', colorHex: '#16A34A' },
      ],
      tiers: [
        { minQty: 1, maxQty: 2, hargaPerUnit: 24500 },
        { minQty: 3, maxQty: 11, hargaPerUnit: 23500 },
        { minQty: 12, maxQty: null, hargaPerUnit: 22500 },
      ],
    },
    {
      name: 'Spidol White Board Snowman',
      keterangan: '1 kotak isi 12 pcs',
      satuanDefault: 'ktk',
      categoryKode: 'ATK',
      variants: [
        { name: 'Hitam', colorHex: '#1E293B' },
        { name: 'Biru', colorHex: '#2563EB' },
        { name: 'Merah', colorHex: '#DC2626' },
      ],
      tiers: [
        { minQty: 1, maxQty: 2, hargaPerUnit: 85000 },
        { minQty: 3, maxQty: 11, hargaPerUnit: 82000 },
        { minQty: 12, maxQty: null, hargaPerUnit: 80000 },
      ],
    },
    {
      name: 'Pensil 2B M2000',
      keterangan: '1 kotak isi 12 pcs',
      satuanDefault: 'ktk',
      categoryKode: 'ATK',
      variants: [
        { name: 'Biru', colorHex: '#2563EB' },
        { name: 'Hijau', colorHex: '#16A34A' },
      ],
      tiers: [
        { minQty: 1, maxQty: 2, hargaPerUnit: 6000 },
        { minQty: 3, maxQty: 11, hargaPerUnit: 5500 },
        { minQty: 12, maxQty: null, hargaPerUnit: 5000 },
      ],
    },
    {
      name: 'Pensil 2B VA',
      keterangan: '1 kotak isi 12 pcs',
      satuanDefault: 'ktk',
      categoryKode: 'ATK',
      variants: [
        { name: 'Hijau', colorHex: '#16A34A' },
        { name: 'Gold', colorHex: '#D97706' },
      ],
      tiers: [
        { minQty: 1, maxQty: 2, hargaPerUnit: 7000 },
        { minQty: 3, maxQty: 11, hargaPerUnit: 6500 },
        { minQty: 12, maxQty: null, hargaPerUnit: 6000 },
      ],
    },
    {
      name: 'Kertas Manila',
      keterangan: '1 pak isi 50 lembar',
      satuanDefault: 'pak',
      categoryKode: 'ATK',
      variants: [
        { name: 'Putih', colorHex: '#F8FAFC' },
        { name: 'Hitam', colorHex: '#1E293B' },
      ],
      tiers: [
        { minQty: 1, maxQty: 4, hargaPerUnit: 75000 },
        { minQty: 5, maxQty: 9, hargaPerUnit: 72000 },
        { minQty: 10, maxQty: null, hargaPerUnit: 70000 },
      ],
    },
    {
      name: 'Double Tape Putih',
      keterangan: 'Daya rekat kuat serbaguna',
      satuanDefault: 'pcs',
      categoryKode: 'ATK',
      variants: [
        { name: '1/2 Inch', colorHex: '#E2E8F0' },
        { name: '1 Inch', colorHex: '#CBD5E1' },
        { name: '2 Inch', colorHex: '#94A3B8' },
      ],
      tiers: [
        { minQty: 1, maxQty: 9, hargaPerUnit: 3500 },
        { minQty: 10, maxQty: 49, hargaPerUnit: 3000 },
        { minQty: 50, maxQty: null, hargaPerUnit: 2500 },
      ],
    },
    {
      name: 'Lakban Coklat 2 inch',
      keterangan: 'Daya rekat tinggi & tahan lama',
      satuanDefault: 'pcs',
      categoryKode: 'ATK',
      variants: [
        { name: '60 Yard', colorHex: '#78350F' },
        { name: '90 Yard', colorHex: '#451A03' },
      ],
      tiers: [
        { minQty: 1, maxQty: 5, hargaPerUnit: 8500 },
        { minQty: 6, maxQty: 35, hargaPerUnit: 8000 },
        { minQty: 36, maxQty: null, hargaPerUnit: 7500 },
      ],
    },
    {
      name: 'Kertas Buffalo Warna',
      keterangan: '1 pak isi 100 lembar',
      satuanDefault: 'pak',
      categoryKode: 'ATK',
      variants: [
        { name: 'Campur Warna', colorHex: '#6366F1' },
        { name: 'Merah', colorHex: '#DC2626' },
        { name: 'Biru', colorHex: '#2563EB' },
        { name: 'Hijau', colorHex: '#16A34A' },
        { name: 'Kuning', colorHex: '#EAB308' },
      ],
      tiers: [
        { minQty: 1, maxQty: 4, hargaPerUnit: 32000 },
        { minQty: 5, maxQty: 9, hargaPerUnit: 30000 },
        { minQty: 10, maxQty: null, hargaPerUnit: 28500 },
      ],
    },
    {
      name: 'Kertas HVS F4 Warna SIDU',
      keterangan: '1 rim isi 500 lembar',
      satuanDefault: 'rim',
      categoryKode: 'ATK',
      variants: [
        { name: 'Merah Muda', colorHex: '#FDA4AF' },
        { name: 'Biru Muda', colorHex: '#93C5FD' },
        { name: 'Kuning Muda', colorHex: '#FEF08A' },
        { name: 'Hijau Muda', colorHex: '#86EFAC' },
      ],
      tiers: [
        { minQty: 1, maxQty: 4, hargaPerUnit: 52000 },
        { minQty: 5, maxQty: 9, hargaPerUnit: 50000 },
        { minQty: 10, maxQty: null, hargaPerUnit: 48000 },
      ],
    },
    {
      name: 'Spidol Warna Montana MP828',
      keterangan: 'Set spidol warna lengkap',
      satuanDefault: 'set',
      categoryKode: 'ATK',
      variants: [
        { name: '12 Warna', colorHex: '#8B5CF6' },
        { name: '24 Warna', colorHex: '#EC4899' },
      ],
      tiers: [
        { minQty: 1, maxQty: 5, hargaPerUnit: 12000 },
        { minQty: 6, maxQty: 11, hargaPerUnit: 11000 },
        { minQty: 12, maxQty: null, hargaPerUnit: 10000 },
      ],
    },
    {
      name: 'Crayon Neon Metalic Van-Art',
      keterangan: '12 Warna Neon & Metalic',
      satuanDefault: 'ktk',
      categoryKode: 'ATK',
      variants: [
        { name: 'Neon', colorHex: '#06B6D4' },
        { name: 'Metalic', colorHex: '#F59E0B' },
      ],
      tiers: [
        { minQty: 1, maxQty: 5, hargaPerUnit: 10000 },
        { minQty: 6, maxQty: 11, hargaPerUnit: 8750 },
        { minQty: 12, maxQty: null, hargaPerUnit: 8500 },
      ],
    },
  ];

  console.log('\nMemproses produk multi-varian...');

  const atkCategory = await prisma.category.findFirst({
    where: { kodeAsal: 'ATK' },
  });

  for (const mp of MULTI_VARIANT_PRODUCTS) {
    console.log(`Membuat/memperbarui produk multi-varian: ${mp.name}`);

    // Cari atau buat produk
    let product = await prisma.product.findFirst({
      where: { nama: { equals: mp.name, mode: 'insensitive' } },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          nama: mp.name,
          keterangan: mp.keterangan,
          satuanDefault: mp.satuanDefault,
          categoryId: atkCategory.id,
          deskripsi: mp.keterangan,
        },
      });
    } else {
      product = await prisma.product.update({
        where: { id: product.id },
        data: {
          keterangan: mp.keterangan,
          satuanDefault: mp.satuanDefault,
        },
      });
    }

    // Bersihkan varian lama untuk produk ini agar fresh
    const oldVariants = await prisma.productVariant.findMany({
      where: { productId: product.id },
    });
    for (const ov of oldVariants) {
      await prisma.priceTier.deleteMany({ where: { productVariantId: ov.id } });
      await prisma.productVariant.delete({ where: { id: ov.id } });
    }

    // Buat varian-varian baru
    for (const v of mp.variants) {
      const createdVariant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          namaVarian: v.name,
          colorHex: v.colorHex,
          satuan: mp.satuanDefault,
          konversi: 1,
        },
      });

      // Buat price tiers untuk varian ini
      await prisma.priceTier.createMany({
        data: mp.tiers.map((t) => ({
          productVariantId: createdVariant.id,
          jenisKemasan: mp.satuanDefault,
          minQty: t.minQty,
          maxQty: t.maxQty,
          hargaPerUnit: t.hargaPerUnit,
        })),
      });
    }

    console.log(`  -> Berhasil membuat ${mp.variants.length} varian untuk ${mp.name}`);
  }

  // 5. Untuk produk lain yang tidak punya multi-varian:
  // Pastikan varian-varian mereka bersih (cukup 1 varian default yang mewakili satuan dan harga tier)
  console.log('\nSinkronisasi selesai!');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
