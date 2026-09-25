import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { nomorOrder: { contains: search, mode: "insensitive" } },
        { namaPemesan: { contains: search, mode: "insensitive" } },
        { namaToko: { contains: search, mode: "insensitive" } },
        { noWhatsApp: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          items: {
            include: {
              productVariant: {
                include: {
                  product: {
                    select: {
                      nama: true,
                      gambar: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar pesanan" },
      { status: 500 },
    );
  }
}
