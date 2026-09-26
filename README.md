# Khalifa Niaga Grosir

Aplikasi Web E-Commerce Grosir & Eceran modern untuk **Khalifa Niaga**, dirancang khusus untuk efisiensi transaksi partai besar dan toko kelontong/eceran berbasis WhatsApp Checkout, katalog harga bertingkat (Tiered Pricing), dan Panel Admin terintegrasi.

---

## Fitur Utama

- **Katalog & Harga Bertingkat Otomatis**: Mendukung multi-satuan (pcs, lusin, pak, dus, dll) dan diskon kuantitas bertingkat per varian.
- **Deteksi Otomatis Jenis Pesanan (Eceran vs Grosir)**: Sistem secara otomatis menentukan status pesanan berdasarkan threshold kuantitas/nilai belanja. Field "Nama Toko" disembunyikan otomatis jika berstatus eceran.
- **WhatsApp Direct Checkout**: Menghasilkan format pesan pesanan rapi, terstruktur, dan siap kirim ke nomor WhatsApp resmi toko.
- **Pencarian Cerdas Toleran Typo**: Pencarian cepat lintas kolom (nama produk, merek, varian, deskripsi, kategori) berbasis PostgreSQL `pg_trgm`.
- **Panel Admin Terproteksi (`/admin/*`)**:
  - Dashboard performa & ringkasan penjualan dengan agregasi SQL (COUNT, SUM) dan in-memory caching.
  - Kelola katalog 480+ produk dengan server-side pagination (20 baris/halaman), edit harga tier on-demand, dan upload foto langsung ke Supabase Storage.
  - Manajemen pesanan pelanggan dengan filter status dan rentang tanggal.
  - Manajemen kategori produk dan pengaturan toko.
- **Optimasi Performa & UX**: Pemanfaatan `next/image` untuk seluruh gambar dan thumbnail, flat icon SVG placeholder per kategori, navigasi instan antar-tab, dan ISR/caching.

---

## Struktur Folder Project

```text
├── prisma/
│   └── schema.prisma            # Skema database PostgreSQL (Prisma ORM)
├── public/
│   └── placeholders/            # Aset placeholder flat SVG per kategori
├── scripts/
│   ├── import-pos-products.js   # Script import dari file Excel iPOS 5 Pro
│   ├── import-structured-json.js# Script import dari JSON terstruktur
│   └── setup-pg-trgm.js         # Setup ekstensi pg_trgm & GIN index di Supabase
├── src/
│   ├── app/
│   │   ├── (customer)/          # Rute Customer Storefront
│   │   │   ├── checkout/        # Halaman Checkout & Konfirmasi WhatsApp
│   │   │   ├── info-toko/       # Profil & kontak toko Khalifa Niaga
│   │   │   ├── katalog/         # Katalog produk lengkap dengan filter & search
│   │   │   ├── keranjang/       # Keranjang belanja & kalkulator kuantiti
│   │   │   ├── produk/[id]/     # Halaman detail produk & tabel tier harga
│   │   │   └── page.tsx         # Beranda toko (Search-first, banner, Pesan Lagi)
│   │   ├── admin/               # Panel Kontrol Admin (Terproteksi)
│   │   │   ├── dashboard/       # Ringkasan omzet, statistik & pesanan baru
│   │   │   ├── products/        # Kelola katalog produk, foto & harga tier
│   │   │   ├── orders/          # Kelola transaksi & status pesanan
│   │   │   ├── categories/      # Kelola kategori barang
│   │   │   ├── customers/       # Daftar pelanggan
│   │   │   ├── settings/        # Pengaturan kontak & banner toko
│   │   │   └── login/           # Halaman login admin Better Auth
│   │   └── api/                 # Endpoint REST API Next.js Route Handlers
│   │       ├── admin/           # API terproteksi untuk panel admin
│   │       ├── cart/calculate/  # Server-side pricing calculator (Anti-tamper)
│   │       ├── orders/          # Pembuatan pesanan & lookup
│   │       └── products/        # Pencarian & katalog publik
│   ├── components/              # Komponen UI modular
│   │   ├── admin/               # Shell navigasi & layout admin
│   │   ├── cart/                # Komponen keranjang & WhatsApp preview
│   │   ├── home/                # Banner, Grid Kategori, Pesan Lagi
│   │   ├── layout/              # Header, Footer, Bottom Navigation
│   │   └── product/             # Kartu produk, tabel tier, selector kuantiti
│   ├── context/                 # Context React (CartContext)
│   ├── hooks/                   # Custom Hooks (useDebounce, useStoreSettings)
│   ├── lib/                     # Utilitas, Prisma client, Auth & formatting
│   └── middleware.ts            # Edge middleware proteksi rute /admin/*
├── .env.example                 # Template environment variables
├── next.config.ts               # Konfigurasi Next.js & Image Optimization
└── package.json
```

---

## Prasyarat Lingkungan

- **Node.js**: v18.18.0 atau lebih baru (disarankan v20 LTS)
- **Database**: PostgreSQL (misalnya Supabase PostgreSQL)
- **Package Manager**: npm

---

## Panduan Instalasi & Menjalankan

### 1. Clone & Install Dependensi
```bash
git clone https://github.com/kharismatokped-commits/KHAKIFA-NIAGA.git
cd KHAKIFA-NIAGA
npm install
```

### 2. Setup Environment Variables
Salin file `.env.example` menjadi `.env.local` (atau `.env`):
```bash
cp .env.example .env.local
```

Lengkapi konfigurasi berikut di `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# PostgreSQL Connection Strings (Prisma)
# Gunakan port 6543 (transaction pooler) untuk DATABASE_URL di serverless
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Gunakan port 5432 (direct connection) untuk migrasi Prisma
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-secure-random-32-character-secret"
BETTER_AUTH_URL="http://localhost:3005"
NEXT_PUBLIC_APP_URL="http://localhost:3005"
NEXT_PUBLIC_WA_MESSAGE="Halo, saya tertarik belanja di Khalifa Niaga"
```

### 3. Generate Prisma Client & Migrasi Database
```bash
# Generate Prisma Client
npx prisma generate

# Sinkronisasi skema ke database PostgreSQL
npx prisma db push
```

### 4. Setup Ekstensi Pencarian Typo-Tolerant (Opsional jika database baru)
Jalankan skrip aktivasi `pg_trgm` dan GIN index:
```bash
node scripts/setup-pg-trgm.js
```

### 5. Import Produk dari Excel iPOS 5 Pro (Opsional)
Untuk mengimpor data produk hasil ekspor iPOS:
```bash
node scripts/import-pos-products.js path/ke/file_export_ipos.xlsx
```
*Script ini otomatis mengelompokkan baris ke produk & varian unik, memvalidasi kuantitas & tier harga, serta mengabaikan baris bermasalah secara transparan.*

### 6. Menjalankan Server Pengembangan
```bash
npm run dev
```
Aplikasi dapat diakses di browser pada:
- **Toko Customer**: [http://localhost:3005](http://localhost:3005)
- **Panel Admin**: [http://localhost:3005/admin](http://localhost:3005/admin)

---

## Build & Production Deployment

Untuk memvalidasi dan membuild aplikasi production:
```bash
npm run build
```

Menjalankan server production:
```bash
npm run start
```

---

## Lisensi & Hak Cipta
Hak Cipta © 2026 Khalifa Niaga. Seluruh hak cipta dilindungi undang-undang.
