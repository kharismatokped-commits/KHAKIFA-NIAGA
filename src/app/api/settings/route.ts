import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = {
        id: "default",
        namaToko: "Khalifa Niaga",
        nomorWhatsApp: "6287789923079",
        alamatToko: "Pasar Pagi Grosir Blok A No. 12, Jakarta",
        teksBannerJudul: "Solusi Belanja Grosir Cepat & Murah",
        teksBannerSubjudul:
          "Katalog online harga bertingkat resmi. Pesan langsung terhubung ke WhatsApp toko.",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching public store settings:", error);
    // Return fallback graceful defaults
    return NextResponse.json({
      success: true,
      data: {
        namaToko: "Khalifa Niaga",
        nomorWhatsApp: "6287789923079",
        alamatToko: "Pasar Pagi Grosir Blok A No. 12, Jakarta",
        teksBannerJudul: "Solusi Belanja Grosir Cepat & Murah",
        teksBannerSubjudul:
          "Katalog online harga bertingkat resmi. Pesan langsung terhubung ke WhatsApp toko.",
      },
    });
  }
}
