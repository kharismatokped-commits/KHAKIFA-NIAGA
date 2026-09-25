import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const settingsSchema = z.object({
  namaToko: z.string().min(2, "Nama toko minimal 2 karakter"),
  nomorWhatsApp: z.string().min(8, "Nomor WhatsApp minimal 8 digit"),
  alamatToko: z.string().min(5, "Alamat toko minimal 5 karakter"),
  teksBannerJudul: z.string().min(3, "Judul banner minimal 3 karakter"),
  teksBannerSubjudul: z.string().min(5, "Subjudul banner minimal 5 karakter"),
});

export async function GET() {
  try {
    const settings = await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
        namaToko: "Khalifa Niaga",
        nomorWhatsApp: "6287789923079",
        alamatToko: "Pasar Pagi Grosir Blok A No. 12, Jakarta",
        teksBannerJudul: "Solusi Belanja Grosir Cepat & Murah",
        teksBannerSubjudul: "Katalog online harga bertingkat resmi. Pesan langsung terhubung ke WhatsApp toko.",
      },
    });

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching store settings:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat pengaturan toko" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = settingsSchema.parse(body);

    // Bersihkan nomor WA jika ada simbol selain angka
    const cleanWa = validated.nomorWhatsApp.replace(/[^0-9]/g, "");

    const settings = await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: {
        namaToko: validated.namaToko,
        nomorWhatsApp: cleanWa,
        alamatToko: validated.alamatToko,
        teksBannerJudul: validated.teksBannerJudul,
        teksBannerSubjudul: validated.teksBannerSubjudul,
      },
      create: {
        id: "default",
        namaToko: validated.namaToko,
        nomorWhatsApp: cleanWa,
        alamatToko: validated.alamatToko,
        teksBannerJudul: validated.teksBannerJudul,
        teksBannerSubjudul: validated.teksBannerSubjudul,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pengaturan toko berhasil disimpan",
      data: settings,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Data tidak valid" },
        { status: 400 }
      );
    }
    console.error("Error saving store settings:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan pengaturan toko" },
      { status: 500 }
    );
  }
}
