import { prisma } from "@/lib/prisma";
import { GROSIR_QTY_THRESHOLD, OrderType } from "@/lib/pricing";
import { CartItemCalculationInput } from "@/lib/validations";

export interface CalculatedItemResult {
  productVariantId: string;
  productId: string;
  productName: string;
  variantName: string;
  gambar?: string;
  jenisKemasan: string;
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
 * Menghitung harga pesanan secara aman di sisi server berskala tunggal (PCS).
 * Mengambil tier harga langsung dari database Prisma dan menentukan tier yang aktif
 * berdasarkan kuantitas masing-masing item secara independen.
 */
export async function calculateServerCart(
  items: CartItemCalculationInput[],
  db: typeof prisma | any = prisma,
): Promise<CalculationResult> {
  const calculatedItems: CalculatedItemResult[] = [];
  let totalHarga = 0;
  let totalQty = 0;

  for (const item of items) {
    const variant = await db.productVariant.findUnique({
      where: { id: item.productVariantId },
      include: {
        product: {
          include: {
            variants: {
              include: {
                priceTiers: { orderBy: { minQty: "asc" } },
              },
            },
          },
        },
        priceTiers: {
          orderBy: { minQty: "asc" },
        },
      },
    });

    if (!variant) {
      throw new Error(
        `Varian produk dengan ID ${item.productVariantId} tidak ditemukan.`,
      );
    }

    // Ambil price tiers dari varian ini, atau fallback ke varian lain dari produk yang sama
    let tiers = variant.priceTiers;
    if (!tiers || tiers.length === 0) {
      const allProductTiers =
        variant.product?.variants?.flatMap((v: any) => v.priceTiers || []) || [];
      tiers = allProductTiers;
    }

    if (!tiers || tiers.length === 0) {
      throw new Error(
        `Tier harga untuk produk "${variant.product.nama}" belum dikonfigurasi.`,
      );
    }

    // Urutkan ascending berdasarkan minQty
    tiers.sort((a: any, b: any) => a.minQty - b.minQty);

    // Cari tier yang cocok berdasarkan qty item ini sendiri (dalam satuan pcs)
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
      variantName: variant.namaVarian || "Standar",
      gambar: variant.gambarVarian || variant.product.gambar[0] || "",
      jenisKemasan: "pcs",
      qty: item.qty,
      hargaPerUnit,
      subtotal,
    });
  }

  // Menentukan jenis pesanan (eceran vs grosir)
  // Aturan: Jika ada minimal 1 item dengan qty >= GROSIR_QTY_THRESHOLD -> grosir
  const isGrosir = calculatedItems.some(
    (item) => item.qty >= GROSIR_QTY_THRESHOLD,
  );

  const orderType: OrderType = isGrosir ? "grosir" : "eceran";

  return {
    items: calculatedItems,
    totalHarga,
    totalQty,
    orderType,
  };
}
