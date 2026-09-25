import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  } catch (error: any) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data kategori", message: error.message },
      { status: 500 }
    );
  }
}
