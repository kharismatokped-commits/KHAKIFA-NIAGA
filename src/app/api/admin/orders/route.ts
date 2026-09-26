import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
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

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          nomorOrder: true,
          namaToko: true,
          namaPemesan: true,
          noWhatsApp: true,
          alamat: true,
          catatan: true,
          jenisPesanan: true,
          totalHarga: true,
          status: true,
          createdAt: true,
          _count: {
            select: { items: true },
          },
        },
      }),
    ]);

    const formattedOrders = orders.map((o) => ({
      ...o,
      itemsCount: o._count.items,
      // Fallback empty array with length to preserve UI checks like items.length
      items: Array.from({ length: o._count.items }, (_, i) => ({ id: `stub-${i}` })),
    }));

    return NextResponse.json({
      success: true,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar pesanan" },
      { status: 500 },
    );
  }
}
