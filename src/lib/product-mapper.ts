import { Product, PriceTier, CategoryId } from "@/types/product";
import { getPlaceholderByCategory } from "@/lib/placeholders";

export function mapDbProductToCustomerProduct(db: any): Product {
  const allTiers = db.variants?.flatMap((v: any) => v.priceTiers || []) || [];

  const primarySatuan = db.variants?.[0]?.satuan?.toLowerCase() || "pcs";

  const primaryTiers: PriceTier[] = allTiers
    .filter((t: any) => (t.jenisKemasan || "").toLowerCase() === primarySatuan)
    .map((t: any) => ({
      minQty: t.minQty,
      maxQty: t.maxQty,
      price: t.hargaPerUnit,
    }));

  const pakTiers: PriceTier[] = allTiers
    .filter(
      (t: any) =>
        (t.jenisKemasan || "").toLowerCase() === "pak" &&
        primarySatuan !== "pak",
    )
    .map((t: any) => ({
      minQty: t.minQty,
      maxQty: t.maxQty,
      price: t.hargaPerUnit,
    }));

  const defaultPcsTiers: PriceTier[] =
    primaryTiers.length > 0
      ? primaryTiers
      : allTiers.length > 0
        ? allTiers.map((t: any) => ({
            minQty: t.minQty,
            maxQty: t.maxQty,
            price: t.hargaPerUnit,
          }))
        : [{ minQty: 1, maxQty: null, price: 5000 }];

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
    isPromo: true,
    promoTag: "Grosir Termurah",
    hasPcs: true,
    unitPcsName: primarySatuan.toUpperCase(),
    tieredPricesPcs: defaultPcsTiers,
    hasPack: pakTiers.length > 0,
    unitPackName: "PAK",
    packRatio: db.variants?.[0]?.konversi || 12,
    tieredPricesPack: pakTiers,
    variants:
      db.variants?.map((v: any) => ({
        id: v.id,
        name: v.namaVarian || v.satuan?.toUpperCase() || "Standar",
        image: v.gambarVarian || undefined,
      })) || [],
  };
}
