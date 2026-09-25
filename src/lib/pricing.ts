import { PriceTier, CartItem, Product } from "@/types/product";

/**
 * Konfigurasi batas kuantitas untuk tier grosir.
 * Jika ada item dengan kuantitas >= GROSIR_QTY_THRESHOLD (atau satuan PAK),
 * pesanan dianggap sebagai "grosir".
 * Terpusat sebagai variabel konfigurasi agar mudah diubah.
 */
export const GROSIR_QTY_THRESHOLD = 10;

export type OrderType = "eceran" | "grosir";

/**
 * Menentukan jenis pesanan ("eceran" atau "grosir") berdasarkan komposisi keranjang:
 * - Jika SEMUA item dalam keranjang berada di tier qty terendah (eceran) -> "eceran"
 * - Jika ADA MINIMAL 1 item yang qty-nya masuk tier grosir (misal >= GROSIR_QTY_THRESHOLD atau kemasan PAK) -> "grosir"
 */
export function getOrderType(
  cartItems: CartItem[],
  threshold: number = GROSIR_QTY_THRESHOLD,
  productsMap?: Map<string, Product>,
): OrderType {
  if (!cartItems || cartItems.length === 0) return "eceran";

  const hasGrosirItem = cartItems.some((item) => {
    // 1. Satuan PAK otomatis dianggap kulakan grosir
    if (item.unitType === "PAK") return true;

    // 2. Cek apakah melampaui tier terendah produk (jika productsMap tersedia)
    if (productsMap && productsMap.has(item.productId)) {
      const prod = productsMap.get(item.productId);
      if (prod && prod.tieredPricesPcs && prod.tieredPricesPcs.length > 1) {
        const lowestTier = prod.tieredPricesPcs[0];
        if (lowestTier.maxQty !== null && item.qty > lowestTier.maxQty) {
          return true;
        }
      }
    }

    // 3. Cek ambang batas kuantitas grosir
    return item.qty >= threshold;
  });

  return hasGrosirItem ? "grosir" : "eceran";
}

/**
 * Mencari tier harga yang aktif berdasarkan jumlah (qty)
 */
export function findActiveTier(
  tiers: PriceTier[],
  qty: number,
): PriceTier | undefined {
  if (!tiers || tiers.length === 0) return undefined;

  // Sort ascending by minQty just in case
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);

  for (const tier of sorted) {
    if (qty >= tier.minQty) {
      if (tier.maxQty === null || qty <= tier.maxQty) {
        return tier;
      }
    }
  }

  // Jika di bawah tier pertama (misal qty < minQty), pakai tier pertama
  return sorted[0];
}

/**
 * Mendapatkan harga satuan berdasarkan jumlah
 */
export function getUnitPrice(tiers: PriceTier[], qty: number): number {
  const activeTier = findActiveTier(tiers, qty);
  return activeTier ? activeTier.price : 0;
}

/**
 * Menghitung persentase hemat dibanding tier pertama (harga eceran dasar)
 */
export function calculateSavings(
  basePrice: number,
  currentPrice: number,
): number {
  if (basePrice <= 0 || currentPrice >= basePrice) return 0;
  return Math.round(((basePrice - currentPrice) / basePrice) * 100);
}

/**
 * Informasi tier berikutnya untuk rekomendasi "Beli X lagi dapat harga lebih murah!"
 */
export function getNextTierRecommendation(
  tiers: PriceTier[],
  currentQty: number,
): {
  targetQty: number;
  moreNeeded: number;
  nextPrice: number;
  potentialSavings: number;
} | null {
  if (!tiers || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);

  for (const tier of sorted) {
    if (tier.minQty > currentQty) {
      const moreNeeded = tier.minQty - currentQty;
      const basePrice = sorted[0].price;
      const potentialSavings = calculateSavings(basePrice, tier.price);
      return {
        targetQty: tier.minQty,
        moreNeeded,
        nextPrice: tier.price,
        potentialSavings,
      };
    }
  }
  return null;
}
