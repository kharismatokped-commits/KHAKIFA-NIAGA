import { Category, Product } from "@/types/product";

export const CATEGORIES: Category[] = [
  {
    id: "atk",
    name: "Alat Tulis & Kantor",
    icon: "PenTool",
    description: "Kebutuhan toko ATK, sekolah, fotocopy & perkantoran",
  },
  {
    id: "plastik-kemasan",
    name: "Plastik & Kemasan",
    icon: "Package",
    description: "Kantong kresek, lakban, kardus & perlengkapan packing",
  },
  {
    id: "rumah-tangga",
    name: "Rumah Tangga",
    icon: "Home",
    description: "Pembersih, sabun cuci, sikat & kebutuhan sanitasi",
  },
  {
    id: "kelontong",
    name: "Kelontong & Sembako",
    icon: "ShoppingBag",
    description: "Kebutuhan warung sembako, minuman sachet & bumbu",
  },
  {
    id: "lainnya",
    name: "Aksesoris & Lainnya",
    icon: "Grid",
    description: "Baterai, gunting, staples & barang serba ada",
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "atk-bolpoin-gel",
    name: "Bolpoin Gel Joyko 0.5mm Tinta Pekat",
    sku: "ATK-JK-01",
    category: "atk",
    description: "Bolpoin gel berkualitas dengan ujung jarum 0.5mm. Menulis sangat lancar, tinta cepat kering, tidak mudah blobor. Sangat diminati anak sekolah dan pekerja kantoran.",
    images: [
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585336261026-7a718797f14b?w=600&auto=format&fit=crop&q=80",
    ],
    rating: 4.9,
    reviewCount: 238,
    minOrder: 1,
    isPopular: true,
    isPromo: true,
    promoTag: "Solusi Stok Murah",
    hasPcs: true,
    unitPcsName: "PCS",
    tieredPricesPcs: [
      { minQty: 1, maxQty: 11, price: 3000 },
      { minQty: 12, maxQty: 47, price: 2600 },
      { minQty: 48, maxQty: null, price: 2300 },
    ],
    hasPack: true,
    unitPackName: "PAK",
    packRatio: 12, // 1 pak = 12 pcs (1 lusin)
    tieredPricesPack: [
      { minQty: 1, maxQty: 4, price: 30000 }, // Rp 2.500/pcs
      { minQty: 5, maxQty: 19, price: 28000 }, // Rp 2.333/pcs
      { minQty: 20, maxQty: null, price: 26000 }, // Rp 2.166/pcs
    ],
    variants: [
      { id: "black", name: "Hitam", colorHex: "#000000" },
      { id: "blue", name: "Biru", colorHex: "#0055b3" },
      { id: "red", name: "Merah", colorHex: "#d91e18" },
    ],
  },
  {
    id: "atk-buku-tulis-sidu",
    name: "Buku Tulis Sinar Dunia (SiDu) 38 Lembar",
    sku: "ATK-SD-38",
    category: "atk",
    description: "Buku tulis bergaris merek SiDu ukuran standard. Kertas putih bersih berkualitas tinggi 70 gsm, garis tajam dan tidak tembus tinta.",
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    ],
    rating: 4.8,
    reviewCount: 312,
    minOrder: 1,
    isPopular: true,
    hasPcs: true,
    unitPcsName: "PCS",
    tieredPricesPcs: [
      { minQty: 1, maxQty: 9, price: 4000 },
      { minQty: 10, maxQty: 49, price: 3600 },
      { minQty: 50, maxQty: null, price: 3300 },
    ],
    hasPack: true,
    unitPackName: "PAK",
    packRatio: 10, // 1 pak = 10 buku
    tieredPricesPack: [
      { minQty: 1, maxQty: 4, price: 35000 },
      { minQty: 5, maxQty: 9, price: 33000 },
      { minQty: 10, maxQty: null, price: 31000 },
    ],
    variants: [
      { id: "isi-38", name: "Isi 38 Lembar" },
      { id: "isi-58", name: "Isi 58 Lembar" },
    ],
  },
  {
    id: "pkg-lakban-daimaru-2inch",
    name: "Lakban Bening Daimaru 2 Inch x 100 Yard",
    sku: "PKG-LK-02",
    category: "plastik-kemasan",
    description: "Lakban opp tape bening merek terpercaya Daimaru. Daya rekat super kuat, tidak mudah putus saat ditarik. Kebutuhan mutlak untuk toko online dan pengepakan ekspedisi.",
    images: [
      "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=600&auto=format&fit=crop&q=80",
    ],
    rating: 4.9,
    reviewCount: 420,
    minOrder: 1,
    isPopular: true,
    isPromo: true,
    promoTag: "Terlaris Toko Grosir",
    hasPcs: true,
    unitPcsName: "PCS",
    tieredPricesPcs: [
      { minQty: 1, maxQty: 5, price: 10500 },
      { minQty: 6, maxQty: 35, price: 9200 },
      { minQty: 36, maxQty: null, price: 8500 },
    ],
    hasPack: true,
    unitPackName: "DUS",
    packRatio: 72, // 1 dus = 72 rol
    tieredPricesPack: [
      { minQty: 1, maxQty: 2, price: 600000 }, // ~Rp 8.333/rol
      { minQty: 3, maxQty: null, price: 575000 }, // ~Rp 7.986/rol
    ],
    variants: [
      { id: "clear", name: "Bening (Clear)" },
      { id: "brown", name: "Cokelat (Tan)" },
    ],
  },
  {
    id: "pkg-kresek-hd-kilat",
    name: "Kantong Kresek HD Kilat Putih Bening (1 Pak isi 50 Lembar)",
    sku: "PKG-KR-15",
    category: "plastik-kemasan",
    description: "Kantong plastik kresek kuat, higienis, tidak berbau tajam dan elastis. Cocok untuk warung makan, laundry, dan toko kelontong.",
    images: [
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80",
    ],
    rating: 4.7,
    reviewCount: 185,
    minOrder: 1,
    isPopular: false,
    hasPcs: true,
    unitPcsName: "PAK", // dihitung per bungkus
    tieredPricesPcs: [
      { minQty: 1, maxQty: 9, price: 7500 },
      { minQty: 10, maxQty: 49, price: 6800 },
      { minQty: 50, maxQty: null, price: 6200 },
    ],
    hasPack: true,
    unitPackName: "IKAT",
    packRatio: 10, // 1 ikat = 10 bungkus
    tieredPricesPack: [
      { minQty: 1, maxQty: 4, price: 65000 },
      { minQty: 5, maxQty: null, price: 60000 },
    ],
    variants: [
      { id: "size-15", name: "Ukuran 15 (Kecil)" },
      { id: "size-24", name: "Ukuran 24 (Sedang)" },
      { id: "size-28", name: "Ukuran 28 (Besar)" },
    ],
  },
  {
    id: "rt-sunlight-650",
    name: "Sunlight Jeruk Nipis Pencuci Piring 650ml",
    sku: "RT-SL-650",
    category: "rumah-tangga",
    description: "Sabun cuci piring konsentrat dengan ekstrak jeruk nipis asli. Cepat melarutkan lemak membandel 10x lebih cepat. Barang fast-moving wajib di etalase toko kelontong.",
    images: [
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80",
    ],
    rating: 4.9,
    reviewCount: 540,
    minOrder: 1,
    isPopular: true,
    isPromo: true,
    promoTag: "Fast Moving",
    hasPcs: true,
    unitPcsName: "PCS",
    tieredPricesPcs: [
      { minQty: 1, maxQty: 11, price: 12500 },
      { minQty: 12, maxQty: 23, price: 11500 },
      { minQty: 24, maxQty: null, price: 10800 },
    ],
    hasPack: true,
    unitPackName: "DUS",
    packRatio: 12, // 1 karton = 12 pouch
    tieredPricesPack: [
      { minQty: 1, maxQty: 4, price: 128000 },
      { minQty: 5, maxQty: null, price: 124000 },
    ],
  },
  {
    id: "klt-kapal-api-mix",
    name: "Kopi Kapal Api Spesial Mix 1 Renceng (10 Sachet)",
    sku: "KLT-KA-MIX",
    category: "kelontong",
    description: "Kopi bubuk instan dengan gula murni beraroma mantap. Kemasan renceng praktis siap gantung di warung kopi atau kelontong.",
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
    ],
    rating: 4.8,
    reviewCount: 390,
    minOrder: 1,
    isPopular: true,
    isPromo: true,
    promoTag: "Stok Harian Reseller",
    hasPcs: true,
    unitPcsName: "RENCENG",
    tieredPricesPcs: [
      { minQty: 1, maxQty: 4, price: 13500 },
      { minQty: 5, maxQty: 19, price: 12500 },
      { minQty: 20, maxQty: null, price: 11800 },
    ],
    hasPack: true,
    unitPackName: "DUS",
    packRatio: 12, // 1 karton = 12 renceng
    tieredPricesPack: [
      { minQty: 1, maxQty: 3, price: 140000 },
      { minQty: 4, maxQty: null, price: 136000 },
    ],
  },
  {
    id: "atk-tipex-joyko",
    name: "Correction Tape Joyko CT-522 Kertas Tip-X",
    sku: "ATK-CT-522",
    category: "atk",
    description: "Pita koreksi kering Joyko panjang 12 meter. Langsung dapat ditulis ulang setelah diaplikasikan tanpa perlu menunggu kering.",
    images: [
      "https://images.unsplash.com/photo-1585336261026-7a718797f14b?w=600&auto=format&fit=crop&q=80",
    ],
    rating: 4.7,
    reviewCount: 160,
    minOrder: 1,
    isPopular: false,
    hasPcs: true,
    unitPcsName: "PCS",
    tieredPricesPcs: [
      { minQty: 1, maxQty: 11, price: 6500 },
      { minQty: 12, maxQty: 35, price: 5800 },
      { minQty: 36, maxQty: null, price: 5200 },
    ],
    hasPack: true,
    unitPackName: "PAK",
    packRatio: 12, // 1 pak = 1 lusin
    tieredPricesPack: [
      { minQty: 1, maxQty: 4, price: 68000 },
      { minQty: 5, maxQty: null, price: 62000 },
    ],
  },
  {
    id: "lain-baterai-abc-aa",
    name: "Baterai ABC Alkaline AA / AAA (Isi 2 + 1 Gratis)",
    sku: "LAIN-ABC-ALK",
    category: "lainnya",
    description: "Baterai daya tahan tinggi bebas merkuri. Cocok untuk mainan anak, remote TV, jam dinding, dan mouse wireless.",
    images: [
      "https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=600&auto=format&fit=crop&q=80",
    ],
    rating: 4.8,
    reviewCount: 215,
    minOrder: 1,
    isPopular: false,
    hasPcs: true,
    unitPcsName: "BLISTER",
    tieredPricesPcs: [
      { minQty: 1, maxQty: 5, price: 14000 },
      { minQty: 6, maxQty: 17, price: 12800 },
      { minQty: 18, maxQty: null, price: 11900 },
    ],
    hasPack: true,
    unitPackName: "DUS",
    packRatio: 12, // 1 kotak = 12 blister
    tieredPricesPack: [
      { minQty: 1, maxQty: 3, price: 142000 },
      { minQty: 4, maxQty: null, price: 135000 },
    ],
    variants: [
      { id: "aa", name: "Tipe AA (Besar)" },
      { id: "aaa", name: "Tipe AAA (Kecil)" },
    ],
  },
];
