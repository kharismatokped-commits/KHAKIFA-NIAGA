import React from "react";
import Link from "next/link";
import { STORE_NAME, DEFAULT_STORE_WHATSAPP } from "@/lib/whatsapp";
import { MessageCircle, MapPin, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { normalizeWhatsAppNumber } from "@/lib/formatters";

export const Footer: React.FC = () => {
  const waUrl = `https://wa.me/${normalizeWhatsAppNumber(DEFAULT_STORE_WHATSAPP)}?text=${encodeURIComponent("Halo admin Khalifa Niaga, saya ingin tanya informasi produk grosir.")}`;

  return (
    <footer className="bg-gray-900 text-gray-300 pt-10 pb-24 sm:pb-12 mt-12 border-t border-gray-800 text-sm">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Kolom 1: Profil Toko */}
        <div>
          <div className="flex items-center gap-2 text-white font-black text-lg mb-2">
            <span className="w-7 h-7 rounded-lg bg-[#146C43] flex items-center justify-center text-white text-sm">
              KN
            </span>
            <span>{STORE_NAME}</span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            Pusat kulakan & grosir alat tulis kantor (ATK), aneka plastik kemasan, perlengkapan rumah tangga dan sembako kelontong. Solusi belanja stok murah untuk warung dan pengecer.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Pasti Grosir • Hitungan Akurat • Kirim Cepat</span>
          </div>
        </div>

        {/* Kolom 2: Kontak & Operasional */}
        <div>
          <h4 className="text-white font-bold mb-3 text-sm">Kontak & Lokasi</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
              <span>Gudang & Toko Khalifa Niaga, Pasar Grosir Baru, Blok C No. 12</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Senin - Minggu: 07.30 - 17.00 WIB</span>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
              <span>WhatsApp Admin: +{DEFAULT_STORE_WHATSAPP}</span>
            </li>
          </ul>
        </div>

        {/* Kolom 3: Cara Kerja Order WhatsApp */}
        <div>
          <h4 className="text-white font-bold mb-3 text-sm">Cara Order Grosir</h4>
          <ul className="space-y-1.5 text-xs text-gray-400">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>1. Pilih barang & kuantitas (makin banyak makin murah)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Masukkan ke keranjang belanja</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Isi data toko & alamat pengiriman</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>4. Pesanan otomatis terformat ke WhatsApp</span>
            </li>
          </ul>

          <div className="mt-4">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-xs font-bold transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi Kami di WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 pt-4 border-t border-gray-800 text-center text-xs text-gray-500">
        © 2026 {STORE_NAME}. Hak Cipta Dilindungi. Sistem Pemesanan Grosir Cepat & Praktis.
      </div>
    </footer>
  );
};
