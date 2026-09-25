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

// Dummy mock products emptied as per instructions to use real API/database data
export const MOCK_PRODUCTS: Product[] = [];
