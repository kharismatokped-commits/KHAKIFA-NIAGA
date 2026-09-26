import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// In-memory cache ringkasan statistik (TTL 3 menit)
let cachedStats: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isFreshRequested = searchParams.get("fresh") === "true";

    const now = Date.now();
    if (!isFreshRequested && cachedStats && now - cachedStats.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(
        {
          success: true,
          cached: true,
          data: cachedStats.data,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=180, stale-while-revalidate=60",
          },
        },
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      ordersTodayCount,
      totalOrders,
      salesAggregate,
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
      // Agregasi SQL langsung di database (SUM totalHarga)
      prisma.order.aggregate({
        _sum: {
          totalHarga: true,
        },
        where: {
          status: {
            notIn: ["cancelled", "dibatalkan"],
          },
        },
      }),
      // Total produk aktif
      prisma.product.count(),
      // 8 pesanan terbaru (tanpa join berat)
      prisma.order.findMany({
        take: 8,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          nomorOrder: true,
          namaPemesan: true,
          namaToko: true,
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

    const totalSales = salesAggregate._sum.totalHarga || 0;

    const resultData = {
      ordersToday: ordersTodayCount,
      totalOrders,
      totalSales,
      activeProducts: activeProductsCount,
      recentOrders: recentOrders.map((o) => ({
        ...o,
        // Adaptasi format items count jika diperlukan frontend
        items: Array.from({ length: o._count.items }),
      })),
    };

    // Simpan ke cache
    cachedStats = {
      data: resultData,
      timestamp: now,
    };

    return NextResponse.json(
      {
        success: true,
        cached: false,
        data: resultData,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=180, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat statistik admin" },
      { status: 500 },
    );
  }
}
