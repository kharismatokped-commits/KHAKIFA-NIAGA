import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      ordersTodayCount,
      totalOrders,
      allOrders,
      activeProductsCount,
      recentOrders,
    ] = await Promise.all([
      // Pesanan hari ini
      prisma.order.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      // Total semua pesanan
      prisma.order.count(),
      // Ambil semua pesanan untuk hitung omzet
      prisma.order.findMany({
        where: {
          status: {
            not: "cancelled",
          },
        },
        select: {
          totalHarga: true,
        },
      }),
      // Total produk aktif
      prisma.product.count(),
      // 5 pesanan terbaru
      prisma.order.findMany({
        take: 8,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          items: {
            select: {
              id: true,
              qty: true,
            },
          },
        },
      }),
    ]);

    const totalSales = allOrders.reduce((sum, o) => sum + o.totalHarga, 0);

    return NextResponse.json({
      success: true,
      data: {
        ordersToday: ordersTodayCount,
        totalOrders,
        totalSales,
        activeProducts: activeProductsCount,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat statistik admin" },
      { status: 500 },
    );
  }
}
