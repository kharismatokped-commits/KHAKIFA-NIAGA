import { Product, PriceTier, CategoryId } from "@/types/product";
import { getPlaceholderByCategory } from "@/lib/placeholders";

// Daftar unit kemasan dari POS yang BUKAN varian jenis produk
const PACKAGING_UNITS = new Set([
  "pcs",
  "-pcs",
  "pak",
  "ktk",
  "dus",
  "lsn",
  "lusin",
  "slop",
  "bal",
  "ikat",
  "rim",
  "rtg",
  "renteng",
  "buah",
  "lembar",
  "standar",
  "default",
  "unit",
  "gross",
  "pack",
  "box",
]);

function isGenuineProductVariant(name?: string | null): boolean {
  if (!name) return false;
  const clean = name.trim().toLowerCase();
  return !PACKAGING_UNITS.has(clean) && !clean.startsWith("-pcs") && clean !== "";
}

export function mapDbProductToCustomerProduct(db: any): Product {
  // 1. Ambil variant utama untuk ID acuan transaksi
  const primaryVariant =
    db.variants?.find(
      (v: any) =>
        (v.satuan || "").toLowerCase() === "pcs" ||
        (v.satuan || "").toLowerCase() === "-pcs" ||
        v.konversi === 1,
    ) || db.variants?.[0];

  // 2. Kumpulkan tingkat harga (tiers) berskala pcs
  let rawTiers = primaryVariant?.priceTiers || [];

  // Jika variant utama tidak ada tiers, ambil dari variant manapun yang ada
  if (!rawTiers || rawTiers.length === 0) {
    const allTiers = db.variants?.flatMap((v: any) => v.priceTiers || []) || [];
    rawTiers = allTiers;
  }

  let pcsTiers: PriceTier[] = [];
  if (rawTiers && rawTiers.length > 0) {
    pcsTiers = rawTiers.map((t: any) => ({
      minQty: t.minQty,
      maxQty: t.maxQty,
      price: t.hargaPerUnit,
    }));
  } else {
    pcsTiers = [{ minQty: 1, maxQty: null, price: 5000 }];
  }

  // Urutkan ascending berdasarkan minQty
  pcsTiers.sort((a, b) => a.minQty - b.minQty);

  // 3. Saring varian: HANYA varian jenis produk asli (misal warna/tipe/model), BUKAN kemasan
  const genuineDbVariants = (db.variants || []).filter((v: any) =>
    isGenuineProductVariant(v.namaVarian),
  );

  const mappedVariants =
    genuineDbVariants.length > 0
      ? genuineDbVariants.map((v: any) => ({
          id: v.id,
          name: v.namaVarian,
          image: v.gambarVarian || undefined,
        }))
      : [
          {
            id: primaryVariant?.id || db.id,
            name: "Standar",
            image: primaryVariant?.gambarVarian || undefined,
          },
        ];

  const categoryCode =
    db.category?.kodeAsal || db.category?.nama || db.categoryId || "atk";

  const hasRealImage =
    db.gambar &&
    Array.isArray(db.gambar) &&
    db.gambar.length > 0 &&
    db.gambar[0] &&
    typeof db.gambar[0] === "string" &&
    db.gambar[0].trim() !== "" &&
    !db.gambar[0].includes("photo-1583485088034-697b5bc54ccd");

  const images = hasRealImage
    ? db.gambar
    : [getPlaceholderByCategory(categoryCode)];

  return {
    id: db.id,
    name: db.nama,
    sku: (db.id || "SKU").toUpperCase(),
    category: (db.categoryId || "atk") as CategoryId,
    categoryCode: db.category?.kodeAsal || undefined,
    description: db.deskripsi || "Produk grosir resmi berkualitas.",
    images: images,
    isPlaceholder: !hasRealImage,
    rating: db.rating || 5.0,
    reviewCount: db.jumlahUlasan || 0,
    minOrder: 1,
    isPopular: true,
    isPromo: Boolean(db.isPromo),
    promoTag: db.isPromo ? "GROSIR TERMURAH" : undefined,

    // Cukup 1 satuan standar: PCS
    hasPcs: true,
    unitPcsName: "pcs",
    tieredPricesPcs: pcsTiers,

    // Konsep banyak satuan (PAK / DUS) dihilangkan
    hasPack: false,
    unitPackName: "pcs",
    packRatio: 1,
    tieredPricesPack: [],

    // Varian yang benar-benar jenis produk
    variants: mappedVariants,
  };
}
