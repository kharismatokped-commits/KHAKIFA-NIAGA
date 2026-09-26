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
    const search = searchParams.get("search");

    const where: any = {};
    if (category) {
      where.categoryId = category;
    }
    if (search) {
      where.OR = [
        { nama: { contains: search, mode: "insensitive" } },
        { deskripsi: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
    });

    return NextResponse.json({
      success: true,
      data: products,
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

    const product = await prisma.$transaction(async (tx) => {
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
        const createdVariant = await tx.productVariant.create({
          data: {
            productId: createdProduct.id,
            namaVarian: variant.namaVarian,
            satuan: variant.satuan || "pcs",
            konversi: variant.konversi || 1,
            gambarVarian: variant.gambarVarian || null,
          },
        });

        for (const tier of variant.priceTiers) {
          await tx.priceTier.create({
            data: {
              productVariantId: createdVariant.id,
              jenisKemasan: tier.jenisKemasan,
              minQty: tier.minQty,
              maxQty: tier.maxQty ?? null,
              hargaPerUnit: tier.hargaPerUnit,
            },
          });
        }
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
    });

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
