import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "ID produk tidak valid" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          include: {
            priceTiers: {
              orderBy: [{ jenisKemasan: "asc" }, { minQty: "asc" }],
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    const { mapDbProductToCustomerProduct } =
      await import("@/lib/product-mapper");

    return NextResponse.json({
      success: true,
      data: product,
      customerProduct: mapDbProductToCustomerProduct(product),
    });
  } catch (error: any) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil rincian produk", message: error.message },
      { status: 500 },
    );
  }
}
