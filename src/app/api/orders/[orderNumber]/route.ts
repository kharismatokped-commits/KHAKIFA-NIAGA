import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Nomor order tidak valid" },
        { status: 400 }
      );
    }

    // Decode URL parameter in case # was encoded as %23
    const decodedOrderNumber = decodeURIComponent(orderNumber);

    const order = await prisma.order.findUnique({
      where: { nomorOrder: decodedOrderNumber },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  select: { id: true, nama: true, gambar: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pesanan dengan nomor order tersebut tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error("GET /api/orders/[orderNumber] error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pesanan", message: error.message },
      { status: 500 }
    );
  }
}
