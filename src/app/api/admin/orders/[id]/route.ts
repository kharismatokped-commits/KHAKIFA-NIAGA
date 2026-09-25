import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "delivered", "cancelled"], {
    error: "Status tidak valid. Harus salah satu dari: pending, confirmed, processing, delivered, cancelled",
  }),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order detail:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat detail pesanan" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateStatusSchema.parse(body);

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: validated.status,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Status pesanan berhasil diperbarui",
      data: order,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Status tidak valid" },
        { status: 400 }
      );
    }
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui status pesanan" },
      { status: 500 }
    );
  }
}
