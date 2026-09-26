import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ProductsQuerySchema } from "@/lib/validations";
import { expandSearchTerms } from "@/lib/search-synonyms";

export const dynamic = "force-dynamic";

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

    const { mapDbProductToCustomerProduct } = await import(
      "@/lib/product-mapper"
    );

    // 1. Jika ada parameter pencarian 'q', gunakan smart pg_trgm search via $queryRaw
    const { normalized, terms } = expandSearchTerms(q || "");

    // Parse multi-select category list jika ada (misal: "cat1,cat2")
    const catList =
      category && category !== "all"
        ? category
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    if (normalized.length > 0) {
      const categoryFilter =
        catList.length > 0
          ? Prisma.sql`AND (
              p."categoryId" IN (${Prisma.join(catList)}) 
              OR c.id IN (${Prisma.join(catList)}) 
              OR c."kodeAsal" IN (${Prisma.join(catList)})
            )`
          : Prisma.empty;

      const matchingRows = await prisma.$queryRaw<
        Array<{ id: string; score: number }>
      >`
        SELECT 
          p.id,
          (
            -- Substring exact match in product name (+2.5)
            (CASE WHEN p.nama ILIKE ${"%" + normalized + "%"} THEN 2.5 ELSE 0.0 END) +
            -- Word similarity using pg_trgm (* 1.8)
            (word_similarity(${normalized}, p.nama) * 1.8) +
            -- Overall trigram similarity (* 1.0)
            (similarity(p.nama, ${normalized}) * 1.0) +
            -- Substring match in description (+0.5)
            (CASE WHEN p.deskripsi ILIKE ${"%" + normalized + "%"} THEN 0.5 ELSE 0.0 END) +
            -- Variant name or Satuan match (+0.8)
            (CASE WHEN EXISTS (
              SELECT 1 FROM "ProductVariant" pv 
              WHERE pv."productId" = p.id 
              AND (
                pv."namaVarian" ILIKE ${"%" + normalized + "%"} 
                OR pv.satuan ILIKE ${"%" + normalized + "%"}
              )
            ) THEN 0.8 ELSE 0.0 END) +
            -- Category match (+0.5)
            (CASE WHEN c.nama ILIKE ${"%" + normalized + "%"} OR c."kodeAsal" ILIKE ${"%" + normalized + "%"} THEN 0.5 ELSE 0.0 END)
          ) AS score
        FROM "Product" p
        JOIN "Category" c ON p."categoryId" = c.id
        WHERE (
          -- 1. pg_trgm fuzzy match
          ${normalized} <% p.nama
          OR p.nama % ${normalized}
          -- 2. Substring match
          OR p.nama ILIKE ${"%" + normalized + "%"}
          OR p.deskripsi ILIKE ${"%" + normalized + "%"}
          -- 3. Variant match
          OR EXISTS (
            SELECT 1 FROM "ProductVariant" pv
            WHERE pv."productId" = p.id
            AND (
              pv."namaVarian" ILIKE ${"%" + normalized + "%"}
              OR pv.satuan ILIKE ${"%" + normalized + "%"}
              OR ${normalized} <% pv."namaVarian"
            )
          )
          -- 4. Category match
          OR c.nama ILIKE ${"%" + normalized + "%"}
          OR c."kodeAsal" ILIKE ${"%" + normalized + "%"}
          -- 5. Synonym terms match
          OR EXISTS (
            SELECT 1 FROM unnest(${terms}::text[]) syn
            WHERE p.nama ILIKE CONCAT('%', syn, '%')
               OR p.deskripsi ILIKE CONCAT('%', syn, '%')
               OR c.nama ILIKE CONCAT('%', syn, '%')
          )
        )
        ${categoryFilter}
        ORDER BY score DESC
        LIMIT ${limit};
      `;

      const productIds = matchingRows.map((r) => r.id);

      if (productIds.length === 0) {
        return NextResponse.json({
          success: true,
          meta: {
            total: 0,
            page: 1,
            limit,
            totalPages: 0,
            query: normalized,
          },
          data: [],
          customerProducts: [],
        });
      }

      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
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
      });

      // Maintain score DESC order from pg_trgm
      const productMap = new Map(products.map((p) => [p.id, p]));
      const sortedProducts = productIds
        .map((id) => productMap.get(id))
        .filter((p): p is (typeof products)[0] => Boolean(p));

      const customerProducts = sortedProducts.map(mapDbProductToCustomerProduct);

      return NextResponse.json(
        {
          success: true,
          meta: {
            total: sortedProducts.length,
            page: 1,
            limit,
            totalPages: 1,
            query: normalized,
          },
          data: sortedProducts,
          customerProducts,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        },
      );
    }

    // 2. Jika tidak ada parameter pencarian 'q', gunakan findMany standar dengan pagination
    const whereClause: any = {};

    if (catList.length > 0) {
      whereClause.OR = catList.flatMap((cat) => [
        { categoryId: cat },
        { category: { kodeAsal: { equals: cat, mode: "insensitive" } } },
        { category: { nama: { contains: cat, mode: "insensitive" } } },
      ]);
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

    const customerProducts = products.map(mapDbProductToCustomerProduct);

    return NextResponse.json(
      {
        success: true,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        data: products,
        customerProducts,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data produk", message: error.message },
      { status: 500 },
    );
  }
}
