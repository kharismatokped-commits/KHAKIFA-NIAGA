import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database Toko Grosir Khalifa Niaga...");

  // 1. Bersihkan data lama jika ada
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.priceTier.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 2. Buat Kategori
  const atk = await prisma.category.create({
    data: {
      id: "atk",
      nama: "Alat Tulis Kantor (ATK)",
      ikon: "BookOpen",
    },
  });

  const rumahTangga = await prisma.category.create({
    data: {
      id: "rumah-tangga",
      nama: "Kebutuhan Rumah Tangga",
      ikon: "Home",
    },
  });

  const plastik = await prisma.category.create({
    data: {
      id: "plastik-kemasan",
      nama: "Plastik & Kemasan",
      ikon: "Package",
    },
  });

  const kelontong = await prisma.category.create({
    data: {
      id: "kelontong",
      nama: "Kelontong & Sembako",
      ikon: "Store",
    },
  });

  const lainnya = await prisma.category.create({
    data: {
      id: "lainnya",
      nama: "Aksesoris & Lainnya",
      ikon: "LayoutGrid",
    },
  });

  // 3. Buat Produk 1: Bolpoin Gel Joyko 0.5mm
  const bolpoin = await prisma.product.create({
    data: {
      id: "atk-bolpoin-gel",
      nama: "Bolpoin Gel Joyko 0.5mm Tinta Pekat",
      deskripsi:
        "Bolpoin gel berkualitas dengan ujung jarum 0.5mm. Menulis sangat lancar, tinta cepat kering, tidak mudah blobor. Sangat diminati anak sekolah dan pekerja kantoran.",
      categoryId: atk.id,
      rating: 4.9,
      jumlahUlasan: 238,
      gambar: [
        "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1585336261026-7a718797f14b?w=600&auto=format&fit=crop&q=80",
      ],
      variants: {
        create: [
          {
            id: "atk-bolpoin-hitam",
            namaVarian: "Tinta Hitam",
            gambarVarian:
              "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80",
            priceTiers: {
              create: [
                // PCS tiers
                { jenisKemasan: "pcs", minQty: 1, maxQty: 11, hargaPerUnit: 3000 },
                { jenisKemasan: "pcs", minQty: 12, maxQty: 47, hargaPerUnit: 2600 },
                { jenisKemasan: "pcs", minQty: 48, maxQty: null, hargaPerUnit: 2300 },
                // PAK tiers (1 PAK = 12 pcs)
                { jenisKemasan: "pak", minQty: 1, maxQty: 3, hargaPerUnit: 30000 },
                { jenisKemasan: "pak", minQty: 4, maxQty: null, hargaPerUnit: 27000 },
              ],
            },
          },
          {
            id: "atk-bolpoin-biru",
            namaVarian: "Tinta Biru",
            gambarVarian:
              "https://images.unsplash.com/photo-1585336261026-7a718797f14b?w=600&auto=format&fit=crop&q=80",
            priceTiers: {
              create: [
                { jenisKemasan: "pcs", minQty: 1, maxQty: 11, hargaPerUnit: 3000 },
                { jenisKemasan: "pcs", minQty: 12, maxQty: 47, hargaPerUnit: 2600 },
                { jenisKemasan: "pcs", minQty: 48, maxQty: null, hargaPerUnit: 2300 },
                { jenisKemasan: "pak", minQty: 1, maxQty: 3, hargaPerUnit: 30000 },
                { jenisKemasan: "pak", minQty: 4, maxQty: null, hargaPerUnit: 27000 },
              ],
            },
          },
        ],
      },
    },
  });

  // 4. Buat Produk 2: Lakban Cokelat Daimaru
  const lakban = await prisma.product.create({
    data: {
      id: "atk-lakban-cokelat",
      nama: "Lakban Cokelat Daimaru 48mm × 90 Yard Tebal Kuat",
      deskripsi:
        "Lakban OPP packaging tape merk Daimaru original. Daya rekat luar biasa kuat, tidak mudah putus saat ditarik. Wajib punya untuk toko, gudang olshop, dan pengemasan kardus.",
      categoryId: plastik.id,
      rating: 4.8,
      jumlahUlasan: 312,
      gambar: [
        "https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=600&auto=format&fit=crop&q=80",
      ],
      variants: {
        create: [
          {
            id: "lakban-cokelat-std",
            namaVarian: "Lebar 48mm Standar",
            priceTiers: {
              create: [
                // PCS tiers
                { jenisKemasan: "pcs", minQty: 1, maxQty: 5, hargaPerUnit: 12500 },
                { jenisKemasan: "pcs", minQty: 6, maxQty: 23, hargaPerUnit: 11000 },
                { jenisKemasan: "pcs", minQty: 24, maxQty: null, hargaPerUnit: 9800 },
                // PAK / DUS tiers (1 DUS = 72 pcs)
                { jenisKemasan: "pak", minQty: 1, maxQty: 2, hargaPerUnit: 690000 },
                { jenisKemasan: "pak", minQty: 3, maxQty: null, hargaPerUnit: 670000 },
              ],
            },
          },
        ],
      },
    },
  });

  // 5. Buat Produk 3: Buku Tulis Sinar Dunia (SiDU) 38 Lembar
  const buku = await prisma.product.create({
    data: {
      id: "atk-buku-tulis-sidu-38",
      nama: "Buku Tulis Sinar Dunia (SiDU) 38 Lembar Kertas Putih",
      deskripsi:
        "Buku tulis favorit sejuta pelajar. Kertas tebal 60 gsm, putih bersih bergaris jelas. 1 pak isi 10 buku dengan motif cover beragam dan menarik.",
      categoryId: atk.id,
      rating: 5.0,
      jumlahUlasan: 520,
      gambar: [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
      ],
      variants: {
        create: [
          {
            id: "buku-sidu-38-std",
            namaVarian: "38 Lembar Standar",
            priceTiers: {
              create: [
                // PCS (satuan buku)
                { jenisKemasan: "pcs", minQty: 1, maxQty: 9, hargaPerUnit: 3800 },
                { jenisKemasan: "pcs", minQty: 10, maxQty: 49, hargaPerUnit: 3400 },
                { jenisKemasan: "pcs", minQty: 50, maxQty: null, hargaPerUnit: 3100 },
                // PAK (1 PAK = 10 buku)
                { jenisKemasan: "pak", minQty: 1, maxQty: 4, hargaPerUnit: 33500 },
                { jenisKemasan: "pak", minQty: 5, maxQty: null, hargaPerUnit: 31000 },
              ],
            },
          },
        ],
      },
    },
  });

  // 6. Buat Produk 4: Plastik Kresek Hitam HD Jumbo
  const kresek = await prisma.product.create({
    data: {
      id: "plastik-kresek-hd-hitam",
      nama: "Kantong Plastik Kresek Hitam HD Tebal Anti Sobek",
      deskripsi:
        "Plastik kresek hitam elastis dan kuat, cocok untuk warung sembako, toko baju, dan packing kiriman belanja pelanggan.",
      categoryId: plastik.id,
      rating: 4.7,
      jumlahUlasan: 145,
      gambar: [
        "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80",
      ],
      variants: {
        create: [
          {
            id: "kresek-uk-28",
            namaVarian: "Ukuran 28 (Sedang)",
            priceTiers: {
              create: [
                { jenisKemasan: "pcs", minQty: 1, maxQty: 9, hargaPerUnit: 8500 },
                { jenisKemasan: "pcs", minQty: 10, maxQty: 29, hargaPerUnit: 7800 },
                { jenisKemasan: "pcs", minQty: 30, maxQty: null, hargaPerUnit: 7200 },
              ],
            },
          },
          {
            id: "kresek-uk-35",
            namaVarian: "Ukuran 35 (Besar)",
            priceTiers: {
              create: [
                { jenisKemasan: "pcs", minQty: 1, maxQty: 9, hargaPerUnit: 14000 },
                { jenisKemasan: "pcs", minQty: 10, maxQty: 29, hargaPerUnit: 12800 },
                { jenisKemasan: "pcs", minQty: 30, maxQty: null, hargaPerUnit: 11800 },
              ],
            },
          },
        ],
      },
    },
  });

  // 7. Buat User Admin jika belum ada
  const existingAdmin = await prisma.user.findFirst({
    where: { email: "admin@khalifaniaga.com" },
  });

  if (!existingAdmin) {
    // Dynamic import to avoid circular issues
    const { auth } = await import("../src/lib/auth");
    await auth.api.signUpEmail({
      body: {
        email: "admin@khalifaniaga.com",
        password: "AdminGrosir2026!",
        name: "Admin Khalifa Niaga",
      },
    });
    console.log("Akun Admin awal berhasil dibuat: admin@khalifaniaga.com");
  } else {
    console.log("Akun Admin sudah ada: admin@khalifaniaga.com");
  }

  // 8. Buat Pengaturan Toko jika belum ada
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      namaToko: "Khalifa Niaga",
      nomorWhatsApp: "6287789923079",
      alamatToko: "Pasar Pagi Grosir Blok A No. 12, Jakarta",
      teksBannerJudul: "Solusi Belanja Grosir Cepat & Murah",
      teksBannerSubjudul: "Katalog online harga bertingkat resmi. Pesan langsung terhubung ke WhatsApp toko.",
    },
  });

  console.log("Seeding selesai! Produk, varian, tier harga, admin, dan pengaturan toko telah siap.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
