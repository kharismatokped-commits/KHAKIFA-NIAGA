import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapDbProductToCustomerProduct } from "@/lib/product-mapper";

export const dynamic = "force-dynamic";

function getPhoneVariants(phone: string): string[] {
  const digits = phone.replace(/[^0-9]/g, "");
  const variants = new Set<string>();
  if (digits) {
    variants.add(digits);
    if (digits.startsWith("0")) {
      variants.add("62" + digits.slice(1));
      variants.add("+62" + digits.slice(1));
    } else if (digits.startsWith("62")) {
      variants.add("0" + digits.slice(2));
      variants.add("+" + digits);
    }
  }
  return Array.from(variants);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ noWhatsApp: string }> }
) {
  try {
    const { noWhatsApp } = await params;
    if (!noWhatsApp) {
      return NextResponse.json(
        { success: false, error: "Nomor WhatsApp diperlukan" },
        { status: 400 }
      );
    }

    const cleanParam = decodeURIComponent(noWhatsApp).trim();
    const phoneVariants = getPhoneVariants(cleanParam);
    const digitsOnly = cleanParam.replace(/[^0-9]/g, "");

    if (!digitsOnly || digitsOnly.length < 5) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Cari pesanan dari nomor ini
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { noWhatsApp: { in: phoneVariants } },
          { noWhatsApp: { contains: digitsOnly.slice(-8) } },
        ],
      },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    category: true,
                    variants: {
                      include: {
                        priceTiers: {
                          orderBy: { minQty: "asc" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!orders || orders.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Agregasi items berdasarkan productVariantId
    interface VariantAgg {
      productVariantId: string;
      productVariant: any;
      orderCount: number;
      totalQty: number;
      lastQty: number;
      lastUnit: "PCS" | "PAK";
      lastOrderedAt: Date;
    }

    const map = new Map<string, VariantAgg>();

    for (const order of orders) {
      for (const item of order.items) {
        if (!item.productVariant || !item.productVariant.product) continue;

        const variantId = item.productVariantId;
        const normalizedUnit: "PCS" | "PAK" =
          (item.jenisKemasan || "").toUpperCase() === "PAK" ? "PAK" : "PCS";

        const existing = map.get(variantId);
        if (!existing) {
          map.set(variantId, {
            productVariantId: variantId,
            productVariant: item.productVariant,
            orderCount: 1,
            totalQty: item.qty,
            lastQty: item.qty,
            lastUnit: normalizedUnit,
            lastOrderedAt: order.createdAt,
          });
        } else {
          existing.orderCount += 1;
          existing.totalQty += item.qty;
          // order diurutkan desc, jadi yang pertama ditemui adalah yang paling baru
        }
      }
    }

    // Urutkan berdasarkan frekuensi pemesanan (terbanyak), lalu total quantity
    const sortedVariants = Array.from(map.values()).sort((a, b) => {
      if (b.orderCount !== a.orderCount) {
        return b.orderCount - a.orderCount;
      }
      return b.totalQty - a.totalQty;
    });

    // Ambil top 6
    const top6 = sortedVariants.slice(0, 6);

    const data = top6.map((item) => {
      const customerProduct = mapDbProductToCustomerProduct(
        item.productVariant.product
      );
      const variantObj = item.productVariant.product.variants?.find(
        (v: any) => v.id === item.productVariantId
      );

      return {
        productVariantId: item.productVariantId,
        variantName:
          variantObj?.namaVarian ||
          variantObj?.satuan?.toUpperCase() ||
          item.productVariant.nama ||
          "Standar",
        lastQty: item.lastQty,
        lastUnit: item.lastUnit,
        orderCount: item.orderCount,
        totalQty: item.totalQty,
        product: customerProduct,
      };
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("GET /api/customers/[noWhatsApp]/repeat-order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memproses data pesan lagi",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
