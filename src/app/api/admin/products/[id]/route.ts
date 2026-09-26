import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const priceTierSchema = z.object({
  jenisKemasan: z.string().min(1, "Jenis kemasan wajib diisi"),
  minQty: z.number().int().min(1, "Min Qty minimal 1"),
  maxQty: z.number().int().nullable().optional(),
  hargaPerUnit: z.number().int().min(100, "Harga per unit minimal Rp 100"),
});

const variantSchema = z.object({
  id: z.string().optional(),
  namaVarian: z.string().min(1, "Nama varian wajib diisi"),
  satuan: z.string().nullable().optional(),
  konversi: z.number().int().optional(),
  gambarVarian: z.string().nullable().optional(),
  priceTiers: z
    .array(priceTierSchema)
    .min(1, "Minimal 1 tier harga per varian"),
});

const updateProductSchema = z.object({
  nama: z.string().min(2, "Nama produk minimal 2 karakter"),
  deskripsi: z.string().nullable().optional().default(""),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  gambar: z.array(z.string()).default([]),
  variants: z.array(variantSchema).min(1, "Produk minimal memiliki 1 varian"),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
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

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product detail:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat detail produk" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateProductSchema.parse(body);

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update basic info
      await tx.product.update({
        where: { id },
        data: {
          nama: validated.nama,
          deskripsi: validated.deskripsi || null,
          categoryId: validated.categoryId,
          gambar: validated.gambar,
        },
      });

      // 2. Ambil id varian lama
      const oldVariants = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true },
      });
      const oldVariantIds = oldVariants.map((v) => v.id);

      // Hapus tier lama
      await tx.priceTier.deleteMany({
        where: { productVariantId: { in: oldVariantIds } },
      });

      // Hapus varian lama
      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      // 3. Masukkan varian dan tier baru
      for (const variant of validated.variants) {
        const satuanVal = variant.satuan || variant.namaVarian.toLowerCase();
        const createdVariant = await tx.productVariant.create({
          data: {
            productId: id,
            namaVarian: variant.namaVarian,
            satuan: satuanVal,
            konversi: variant.konversi || 1,
            gambarVarian: variant.gambarVarian || null,
          },
        });

        for (const tier of variant.priceTiers) {
          await tx.priceTier.create({
            data: {
              productVariantId: createdVariant.id,
              jenisKemasan: tier.jenisKemasan || satuanVal,
              minQty: tier.minQty,
              maxQty: tier.maxQty ?? null,
              hargaPerUnit: tier.hargaPerUnit,
            },
          });
        }
      }

      return await tx.product.findUnique({
        where: { id },
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

    return NextResponse.json({ success: true, data: updated });
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
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui produk" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const variants = await prisma.productVariant.findMany({
      where: { productId: id },
      select: { id: true },
    });
    const variantIds = variants.map((v) => v.id);

    const orderItemCount = await prisma.orderItem.count({
      where: { productVariantId: { in: variantIds } },
    });

    if (orderItemCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Produk ini memiliki riwayat transaksi/pesanan sehingga tidak dapat dihapus permanen.",
        },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.priceTier.deleteMany({
        where: { productVariantId: { in: variantIds } },
      });
      await tx.productVariant.deleteMany({
        where: { productId: id },
      });
      await tx.product.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus produk" },
      { status: 500 },
    );
  }
}
