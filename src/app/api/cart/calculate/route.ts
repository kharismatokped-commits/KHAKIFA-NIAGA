import { NextRequest, NextResponse } from "next/server";
import { CartCalculationRequestSchema } from "@/lib/validations";
import { calculateServerCart } from "@/lib/server-pricing";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CartCalculationRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Payload keranjang belanja tidak valid",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    // Perhitungan harga tier selalu dilakukan di server dari database
    const calculation = await calculateServerCart(parsed.data.items);

    return NextResponse.json({
      success: true,
      data: calculation,
    });
  } catch (error: any) {
    console.error("POST /api/cart/calculate error:", error);
    return NextResponse.json(
      {
        error: "Gagal menghitung harga keranjang",
        message: error.message || "Terjadi kesalahan pada server",
      },
      { status: 400 }
    );
  }
}
