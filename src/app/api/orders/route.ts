import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateOrderRequestSchema } from "@/lib/validations";
import { calculateServerCart } from "@/lib/server-pricing";
import { generateOrderNumber } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateOrderRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Data formulir pemesanan tidak valid",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { namaToko, namaPemesan, noWhatsApp, alamat, catatan, items } = parsed.data;

    // Generate unique order number with standard pattern #KN-XXXXXX-XXX
    const nomorOrder = generateOrderNumber();

    // Jalankan seluruh kalkulasi harga dan penyimpanan dalam satu Prisma transaction
    // Ini mencegah manipulasi harga dan data setengah tersimpan jika terjadi error
    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1. Hitung harga dan tier independen di server berdasarkan data transaksi
      const calculation = await calculateServerCart(items, tx);

      // 2. Simpan Order bersama OrderItem[] dengan harga snapshot
      const order = await tx.order.create({
        data: {
          nomorOrder,
          namaToko,
          namaPemesan,
          noWhatsApp,
          alamat,
          catatan: catatan || null,
          jenisPesanan: calculation.orderType, // "eceran" atau "grosir"
          totalHarga: calculation.totalHarga,
          status: "pending",
          items: {
            create: calculation.items.map((item) => ({
              productVariantId: item.productVariantId,
              jenisKemasan: item.jenisKemasan,
              qty: item.qty,
              hargaPerUnit: item.hargaPerUnit, // Snapshot harga saat checkout
              subtotal: item.subtotal,
            })),
          },
        },
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

      return order;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Pesanan berhasil disimpan",
        nomorOrder: createdOrder.nomorOrder,
        orderId: createdOrder.id,
        jenisPesanan: createdOrder.jenisPesanan,
        totalHarga: createdOrder.totalHarga,
        data: createdOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      {
        error: "Gagal memproses pesanan",
        message: error.message || "Terjadi kesalahan pada transaksi database",
      },
      { status: 400 }
    );
  }
}
