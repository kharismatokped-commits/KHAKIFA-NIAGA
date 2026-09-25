import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";

    // Ambil seluruh order dengan itemnya untuk agregasi data pelanggan
    const allOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          select: {
            id: true,
            qty: true,
            jenisKemasan: true,
            hargaPerUnit: true,
            subtotal: true,
          },
        },
      },
    });

    // Kelompokkan berdasarkan kombinasi namaToko + noWhatsApp
    const customerMap = new Map<string, {
      id: string;
      namaToko: string;
      namaPemesan: string;
      noWhatsApp: string;
      alamat: string;
      totalOrders: number;
      totalSpent: number;
      lastOrderDate: Date;
      orders: any[];
    }>();

    for (const order of allOrders) {
      // Normalisasi key
      const storeNameKey = (order.namaToko || "Pelanggan Tanpa Toko").trim().toLowerCase();
      const phoneKey = order.noWhatsApp.replace(/[^0-9]/g, "");
      const key = `${storeNameKey}___${phoneKey}`;

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          namaToko: order.namaToko ? order.namaToko.trim() : "Pelanggan Eceran",
          namaPemesan: order.namaPemesan.trim(),
          noWhatsApp: order.noWhatsApp.trim(),
          alamat: order.alamat,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt,
          orders: [],
        });
      }

      const record = customerMap.get(key)!;
      record.totalOrders += 1;
      record.totalSpent += order.totalHarga;

      // Catat tanggal pesanan terbaru
      if (new Date(order.createdAt) > new Date(record.lastOrderDate)) {
        record.lastOrderDate = order.createdAt;
        record.namaPemesan = order.namaPemesan.trim();
        record.alamat = order.alamat;
      }

      record.orders.push({
        id: order.id,
        nomorOrder: order.nomorOrder,
        jenisPesanan: order.jenisPesanan,
        totalHarga: order.totalHarga,
        status: order.status,
        createdAt: order.createdAt,
        itemsCount: order.items.reduce((acc, curr) => acc + curr.qty, 0),
      });
    }

    let customerList = Array.from(customerMap.values());

    // Filter search jika ada
    if (search) {
      customerList = customerList.filter(
        (c) =>
          c.namaToko.toLowerCase().includes(search) ||
          c.namaPemesan.toLowerCase().includes(search) ||
          c.noWhatsApp.toLowerCase().includes(search)
      );
    }

    // Urutkan berdasarkan total belanja terbanyak
    customerList.sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json({
      success: true,
      data: customerList,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data pelanggan" },
      { status: 500 }
    );
  }
}
