import { Product, PriceTier, CategoryId } from "@/types/product";

export function mapDbProductToCustomerProduct(db: any): Product {
  const allTiers = db.variants?.flatMap((v: any) => v.priceTiers || []) || [];

  const pcsTiers: PriceTier[] = allTiers
    .filter((t: any) => t.jenisKemasan.toLowerCase() === "pcs")
    .map((t: any) => ({
      minQty: t.minQty,
      maxQty: t.maxQty,
      price: t.hargaPerUnit,
    }));

  const pakTiers: PriceTier[] = allTiers
    .filter((t: any) => t.jenisKemasan.toLowerCase() === "pak")
    .map((t: any) => ({
      minQty: t.minQty,
      maxQty: t.maxQty,
      price: t.hargaPerUnit,
    }));

  const defaultPcsTiers: PriceTier[] =
    pcsTiers.length > 0
      ? pcsTiers
      : allTiers.length > 0
        ? allTiers.map((t: any) => ({
            minQty: t.minQty,
            maxQty: t.maxQty,
            price: t.hargaPerUnit,
          }))
        : [{ minQty: 1, maxQty: null, price: 5000 }];

  return {
    id: db.id,
    name: db.nama,
    sku: (db.id || "SKU").toUpperCase(),
    category: (db.categoryId || "atk") as CategoryId,
    description: db.deskripsi,
    images:
      db.gambar && db.gambar.length > 0
        ? db.gambar
        : [
            "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600",
          ],
    rating: db.rating || 5.0,
    reviewCount: db.jumlahUlasan || 0,
    minOrder: 1,
    isPopular: true,
    isPromo: true,
    promoTag: "Grosir Termurah",
    hasPcs: true,
    unitPcsName: "PCS",
    tieredPricesPcs: defaultPcsTiers,
    hasPack: pakTiers.length > 0,
    unitPackName: "PAK",
    packRatio: 12,
    tieredPricesPack: pakTiers,
    variants:
      db.variants?.map((v: any) => ({
        id: v.id,
        name: v.namaVarian,
        image: v.gambarVarian || undefined,
      })) || [],
  };
}
