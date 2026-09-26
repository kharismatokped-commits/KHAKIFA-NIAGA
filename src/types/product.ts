export type CategoryId =
  "atk" | "rumah-tangga" | "plastik-kemasan" | "kelontong" | "lainnya";

export interface Category {
  id: CategoryId;
  name: string;
  icon: string; // Lucide icon name
  description: string;
}

export interface PriceTier {
  minQty: number;
  maxQty: number | null; // null means "and above" (e.g. 50+)
  price: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  colorHex?: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: CategoryId;
  categoryCode?: string;
  description: string;
  images: string[];
  isPlaceholder?: boolean;
  rating: number;
  reviewCount: number;
  minOrder: number;
  isPopular?: boolean;
  isPromo?: boolean;
  promoTag?: string; // e.g. "Solusi Stok Murah"

  // Satuan PCS
  hasPcs: boolean;
  unitPcsName: string; // "PCS" / "Buah"
  tieredPricesPcs: PriceTier[];

  // Satuan PAK / DUS
  hasPack: boolean;
  unitPackName: string; // "PAK" / "DUS" / "LUSIN"
  packRatio: number; // berapa pcs dalam 1 pak, misal 12 atau 24 atau 50
  tieredPricesPack: PriceTier[];

  variants?: ProductVariant[];
}

export type UnitType = "PCS" | "PAK";

export interface CartItem {
  id: string; // unique item id in cart (combination of productId, variantId, unitType)
  productId: string;
  productName: string;
  sku: string;
  category: CategoryId;
  image: string;
  variantId?: string;
  variantName?: string;
  unitType: UnitType;
  packRatio: number; // 1 for PCS, or N for PAK
  qty: number;
  unitPrice: number; // computed from current tier
  subtotal: number;
  selected: boolean;
}

export interface CustomerOrderInfo {
  storeName: string;
  customerName: string;
  whatsappNumber: string;
  address: string;
  notes?: string;
}
