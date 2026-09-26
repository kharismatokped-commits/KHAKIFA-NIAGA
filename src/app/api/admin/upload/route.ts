import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File gambar tidak ditemukan." },
        { status: 400 },
      );
    }

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Format file harus berupa gambar (JPG, PNG, WebP, SVG)." },
        { status: 400 },
      );
    }

    // Batasi ukuran maksimal 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Ukuran file terlalu besar. Maksimal 5MB." },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: "Konfigurasi Supabase Storage belum disetel." },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("Supabase storage error:", error);
      return NextResponse.json(
        { success: false, error: `Gagal mengupload ke storage: ${error.message}` },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      fileName: data.path,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Terjadi kesalahan saat upload." },
      { status: 500 },
    );
  }
}
