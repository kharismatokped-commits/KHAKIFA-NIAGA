import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const categorySchema = z.object({
  id: z.string().optional(),
  nama: z.string().min(2, "Nama kategori minimal 2 karakter"),
  ikon: z.string().min(1, "Ikon wajib diisi"),
});

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { nama: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil daftar kategori" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = categorySchema.parse(body);

    // Generate id jika tidak disediakan
    const id =
      validated.id ||
      validated.nama
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const existing = await prisma.category.findUnique({ where: { id } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Kategori dengan ID tersebut sudah ada" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        id,
        nama: validated.nama,
        ikon: validated.ikon,
      },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Data tidak valid" },
        { status: 400 }
      );
    }
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambahkan kategori" },
      { status: 500 }
    );
  }
}
