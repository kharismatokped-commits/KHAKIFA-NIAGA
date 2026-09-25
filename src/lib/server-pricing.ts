import { prisma } from "@/lib/prisma";
import { GROSIR_QTY_THRESHOLD, OrderType } from "@/lib/pricing";
import { CartItemCalculationInput } from "@/lib/validations";

export interface CalculatedItemResult {
  productVariantId: string;
  productId: string;
  productName: string;
  variantName: string;
  gambar?: string;
  jenisKemasan: "pcs" | "pak";
  qty: number;
  hargaPerUnit: number;
  subtotal: number;
}

export interface CalculationResult {
  items: CalculatedItemResult[];
  totalHarga: number;
  totalQty: number;
  orderType: OrderType;
}

/**
 * Menghitung harga pesanan secara aman di sisi server.
 * Mengambil tier harga langsung dari database Prisma dan menentukan tier yang aktif
 * berdasarkan kuantitas masing-masing item secara independen.
 */
export async function calculateServerCart(
  items: CartItemCalculationInput[],
  db: typeof prisma | any = prisma
): Promise<CalculationResult> {
  const calculatedItems: CalculatedItemResult[] = [];
  let totalHarga = 0;
  let totalQty = 0;

  for (const item of items) {
    const variant = await db.productVariant.findUnique({
      where: { id: item.productVariantId },
      include: {
        product: true,
        priceTiers: {
          where: { jenisKemasan: item.jenisKemasan },
          orderBy: { minQty: "asc" },
        },
      },
    });

    if (!variant) {
      throw new Error(`Varian produk dengan ID ${item.productVariantId} tidak ditemukan.`);
    }

    if (!variant.priceTiers || variant.priceTiers.length === 0) {
      throw new Error(
        `Tier harga untuk varian "${variant.namaVarian}" dengan kemasan "${item.jenisKemasan}" belum dikonfigurasi.`
      );
    }

    // Cari tier yang cocok berdasarkan qty item ini sendiri
    const tiers = variant.priceTiers;
    let matchedTier = tiers[0];

    for (const tier of tiers) {
      if (item.qty >= tier.minQty) {
        if (tier.maxQty === null || item.qty <= tier.maxQty) {
          matchedTier = tier;
        }
      }
    }

    const hargaPerUnit = matchedTier.hargaPerUnit;
    const subtotal = item.qty * hargaPerUnit;

    totalHarga += subtotal;
    totalQty += item.qty;

    calculatedItems.push({
      productVariantId: variant.id,
      productId: variant.productId,
      productName: variant.product.nama,
      variantName: variant.namaVarian,
      gambar: variant.gambarVarian || variant.product.gambar[0] || "",
      jenisKemasan: item.jenisKemasan,
      qty: item.qty,
      hargaPerUnit,
      subtotal,
    });
  }

  // Menentukan jenis pesanan (eceran vs grosir)
  // Aturan: Jika ada minimal 1 item kemasan pak ATAU qty >= GROSIR_QTY_THRESHOLD -> grosir
  const isGrosir = calculatedItems.some(
    (item) => item.jenisKemasan === "pak" || item.qty >= GROSIR_QTY_THRESHOLD
  );

  const orderType: OrderType = isGrosir ? "grosir" : "eceran";

  return {
    items: calculatedItems,
    totalHarga,
    totalQty,
    orderType,
  };
}
