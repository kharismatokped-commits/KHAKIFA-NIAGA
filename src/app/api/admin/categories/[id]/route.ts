import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateCategorySchema = z.object({
  nama: z.string().min(2, "Nama kategori minimal 2 karakter"),
  ikon: z.string().min(1, "Ikon wajib diisi"),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateCategorySchema.parse(body);

    const updated = await prisma.category.update({
      where: { id },
      data: {
        nama: validated.nama,
        ikon: validated.ikon,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0]?.message || "Data tidak valid",
        },
        { status: 400 },
      );
    }
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui kategori" },
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

    // Cek apakah masih memiliki produk
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Tidak bisa menghapus kategori ini karena masih digunakan oleh ${productCount} produk`,
        },
        { status: 400 },
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus kategori" },
      { status: 500 },
    );
  }
}
