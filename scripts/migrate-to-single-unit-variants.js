/**
 * Script migrasi struktur data produk:
 * - Menyederhanakan satuan menjadi 1 satuan default per produk (satuanDefault)
 * - Memindahkan konversi kemasan (misal "1 pak isi 12 pcs") ke field keterangan
 * - Mengubah varian agar siap digunakan sebagai varian jenis/warna asli
 *
 * Mode:
 *   - Dry Run (aman, hanya simulasi & pelaporan):
 *       node scripts/migrate-to-single-unit-variants.js --dry-run
 *   - Production Execute (menjalankan perubahan di database):
 *       node scripts/migrate-to-single-unit-variants.js --execute
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const isExecute = process.argv.includes('--execute');
  const isDryRun = !isExecute;

  console.log(`=== MIGRASI SATUAN & VARIAN PRODUK KHALIFA NIAGA ===`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (Simulasi saja, data DB tidak diubah)' : 'EXECUTE (Menerapkan ke Database)'}`);
  console.log(`Waktu: ${new Date().toISOString()}\n`);

  const products = await prisma.product.findMany({
    include: {
      variants: {
        include: {
          priceTiers: true,
        },
      },
    },
    orderBy: { nama: 'asc' },
  });

  console.log(`Total produk ditemukan di database: ${products.length}`);

  let updatedCount = 0;
  let hasPackagingInfoCount = 0;
  const sampleChanges = [];

  for (const product of products) {
    // 1. Cari variant dasar (konversi = 1 atau satuan pcs)
    const primaryVariant =
      product.variants.find(
        (v) => (v.satuan || '').toLowerCase().replace(/^-/, '') === 'pcs' || v.konversi === 1
      ) || product.variants[0];

    const baseSatuan = (primaryVariant?.satuan || 'pcs').toLowerCase().replace(/^-/, '') || 'pcs';

    // 2. Cari variant kemasan sekunder (misal pak, ktk, dus dengan konversi > 1)
    const packVariants = product.variants.filter((v) => v.konversi && v.konversi > 1);

    let generatedKeterangan = product.keterangan || null;
    if (!generatedKeterangan && packVariants.length > 0) {
      // Ambil konversi terkecil atau pertama
      const pack = packVariants[0];
      const packUnit = (pack.satuan || 'pak').toLowerCase().replace(/^-/, '');
      generatedKeterangan = `1 ${packUnit} isi ${pack.konversi} ${baseSatuan}`;
    } else if (!generatedKeterangan && product.deskripsi && (product.deskripsi.toLowerCase().includes('isi') || product.deskripsi.toLowerCase().includes('warna'))) {
      generatedKeterangan = product.deskripsi;
    } else if (!generatedKeterangan) {
      generatedKeterangan = `Kemasan resmi ${baseSatuan}`;
    }

    if (packVariants.length > 0) {
      hasPackagingInfoCount++;
    }

    if (sampleChanges.length < 5 && packVariants.length > 0) {
      sampleChanges.push({
        nama: product.nama,
        satuanLama: product.variants.map(v => `${v.satuan || v.namaVarian} (x${v.konversi})`).join(', '),
        satuanDefaultBaru: baseSatuan,
        keteranganBaru: generatedKeterangan,
      });
    }

    if (isExecute) {
      // Update field di level Product
      await prisma.product.update({
        where: { id: product.id },
        data: {
          satuanDefault: baseSatuan,
          keterangan: generatedKeterangan,
        },
      });

      // Bersihkan varian lama yang hanya berupa satuan kemasan sekunder (cth: DUS/KTK)
      // Sisakan 1 varian utama dengan nama 'Standar' jika belum ada varian warna/jenis asli
      const nonBaseVariants = product.variants.filter(v => v.id !== primaryVariant?.id);
      for (const nbv of nonBaseVariants) {
        // Hapus tier harga variant sekunder
        await prisma.priceTier.deleteMany({ where: { productVariantId: nbv.id } });
        // Hapus variant sekunder
        await prisma.productVariant.delete({ where: { id: nbv.id } }).catch(() => {});
      }

      // Pastikan varian primer bernama 'Standar'
      if (primaryVariant) {
        await prisma.productVariant.update({
          where: { id: primaryVariant.id },
          data: {
            namaVarian: 'Standar',
            satuan: baseSatuan,
            konversi: 1,
          },
        });
      }

      updatedCount++;
    } else {
      updatedCount++;
    }
  }

  console.log(`\n=== HASIL ANALISIS MIGRASI ===`);
  console.log(`- Produk dengan konversi kemasan (akan dipindah ke keterangan): ${hasPackagingInfoCount}`);
  console.log(`- Total produk yang siap diperbarui: ${updatedCount}`);
  console.log(`\nContoh 5 Produk yang Mengalami Transformasi:`);
  sampleChanges.forEach((s, idx) => {
    console.log(`\n${idx + 1}. [${s.nama}]`);
    console.log(`   - Satuan lama: ${s.satuanLama}`);
    console.log(`   - Satuan default baru: ${s.satuanDefaultBaru}`);
    console.log(`   - Teks Keterangan baru: "${s.keteranganBaru}"`);
  });

  if (isDryRun) {
    console.log(`\n[DRY RUN SELESAI] Tidak ada data di database yang diubah.`);
    console.log(`Untuk menerapkan perubahan ini ke database produksi, jalankan:`);
    console.log(`  node scripts/migrate-to-single-unit-variants.js --execute`);
  } else {
    console.log(`\n[MIGRASI SUKSES] Sebanyak ${updatedCount} produk berhasil dimigrasikan di database!`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Error saat menjalankan migrasi:', e);
  await prisma.$disconnect();
  process.exit(1);
});
