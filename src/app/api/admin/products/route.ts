import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const priceTierSchema = z.object({
  id: z.string().optional(),
  jenisKemasan: z
    .string()
    .min(1, "Jenis kemasan wajib diisi (contoh: pcs atau pak)"),
  minQty: z.number().int().min(1, "Min Qty minimal 1"),
  maxQty: z.number().int().nullable().optional(),
  hargaPerUnit: z.number().int().min(100, "Harga per unit minimal Rp 100"),
});

const variantSchema = z.object({
  id: z.string().optional(),
  namaVarian: z.string().min(1, "Nama varian wajib diisi"),
  satuan: z.string().optional(),
  konversi: z.number().int().optional(),
  gambarVarian: z.string().nullable().optional(),
  priceTiers: z
    .array(priceTierSchema)
    .min(1, "Setiap varian minimal memiliki 1 tier harga"),
});

const productSchema = z.object({
  id: z.string().optional(),
  nama: z.string().min(2, "Nama produk minimal 2 karakter"),
  deskripsi: z.string().optional().default(""),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  gambar: z.array(z.string()).default([]),
  variants: z.array(variantSchema).min(1, "Produk minimal memiliki 1 varian"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.trim();
    const photo = searchParams.get("photo"); // "all" | "no_photo" | "has_photo"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category && category !== "all") {
      where.categoryId = category;
    }
    if (search) {
      where.OR = [
        { nama: { contains: search, mode: "insensitive" } },
        { deskripsi: { contains: search, mode: "insensitive" } },
        {
          variants: {
            some: {
              namaVarian: { contains: search, mode: "insensitive" },
            },
          },
        },
      ];
    }
    if (photo === "no_photo") {
      where.gambar = { isEmpty: true };
    } else if (photo === "has_photo") {
      where.gambar = { isEmpty: false };
    }

    const [total, products, totalNoPhoto, totalAll] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          nama: true,
          deskripsi: true,
          categoryId: true,
          gambar: true,
          isPromo: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              nama: true,
              kodeAsal: true,
            },
          },
          variants: {
            select: {
              id: true,
              namaVarian: true,
              satuan: true,
              konversi: true,
              priceTiers: {
                select: {
                  id: true,
                  jenisKemasan: true,
                  minQty: true,
                  maxQty: true,
                  hargaPerUnit: true,
                },
                orderBy: { minQty: "asc" },
              },
            },
          },
        },
      }),
      prisma.product.count({ where: { gambar: { isEmpty: true } } }),
      prisma.product.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        noPhotoCount: totalNoPhoto,
        totalAll,
      },
    });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar produk" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = productSchema.parse(body);

    const id =
      validated.id ||
      validated.nama
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
        "-" +
        Math.random().toString(36).substring(2, 6);

    const product = await prisma.$transaction(
      async (tx) => {
        const createdProduct = await tx.product.create({
          data: {
            id,
            nama: validated.nama,
            deskripsi: validated.deskripsi,
            categoryId: validated.categoryId,
            gambar: validated.gambar.filter(Boolean),
          },
        });

        for (const variant of validated.variants) {
          const satuanVal = variant.satuan || variant.namaVarian.toLowerCase();
          await tx.productVariant.create({
            data: {
              productId: createdProduct.id,
              namaVarian: variant.namaVarian,
              satuan: satuanVal,
              konversi: variant.konversi || 1,
              gambarVarian: variant.gambarVarian || null,
              priceTiers: {
                create: variant.priceTiers.map((tier) => ({
                  jenisKemasan: tier.jenisKemasan || satuanVal,
                  minQty: tier.minQty,
                  maxQty: tier.maxQty ?? null,
                  hargaPerUnit: tier.hargaPerUnit,
                })),
              },
            },
          });
        }

        return await tx.product.findUnique({
          where: { id: createdProduct.id },
          include: {
            category: true,
            variants: {
              include: {
                priceTiers: true,
              },
            },
          },
        });
      },
      {
        maxWait: 15000,
        timeout: 30000,
      },
    );

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0]?.message || "Data produk tidak valid",
        },
        { status: 400 },
      );
    }
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat produk baru" },
      { status: 500 },
    );
  }
}
