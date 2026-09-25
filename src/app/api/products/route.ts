import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductsQuerySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsedQuery = ProductsQuerySchema.safeParse({
      category: searchParams.get("category") || undefined,
      q: searchParams.get("q") || undefined,
      limit: searchParams.get("limit") || undefined,
      page: searchParams.get("page") || undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          error: "Parameter pencarian tidak valid",
          details: parsedQuery.error.format(),
        },
        { status: 400 },
      );
    }

    const { category, q, limit, page } = parsedQuery.data;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (category && category !== "all") {
      whereClause.categoryId = category;
    }

    if (q && q.trim()) {
      whereClause.OR = [
        { nama: { contains: q.trim(), mode: "insensitive" } },
        { deskripsi: { contains: q.trim(), mode: "insensitive" } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: {
            select: { id: true, nama: true, ikon: true },
          },
          variants: {
            include: {
              priceTiers: {
                orderBy: { minQty: "asc" },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const { mapDbProductToCustomerProduct } =
      await import("@/lib/product-mapper");
    const customerProducts = products.map(mapDbProductToCustomerProduct);

    return NextResponse.json({
      success: true,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: products,
      customerProducts,
    });
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data produk", message: error.message },
      { status: 500 },
    );
  }
}
