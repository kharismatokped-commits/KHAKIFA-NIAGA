"use client";

import React, { useState } from "react";
import Image from "next/image";
import { normalizeWhatsAppNumber } from "@/lib/formatters";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import {
  Store,
  Phone,
  MapPin,
  Clock,
  RotateCcw,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InfoTokoPage() {
  const storeSettings = useStoreSettings();
  const [resetSuccess, setResetSuccess] = useState(false);
  const phone =
    normalizeWhatsAppNumber(storeSettings.nomorWhatsApp || "6287789923079") ||
    "6287789923079";
  const defaultMessage =
    process.env.NEXT_PUBLIC_WA_MESSAGE ||
    "Halo, saya tertarik belanja di Khalifa Niaga";
  const waLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(defaultMessage)}`;

  const handleClearCache = () => {
    try {
      localStorage.removeItem("khalifa_niaga_cart_v1");
      localStorage.removeItem("khalifa_niaga_customer_v1");
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        window.location.reload();
      }, 1200);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-12 max-w-2xl mx-auto">
      {/* Header Profile */}
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-6 text-white text-center shadow-md">
        <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3 shadow-md p-2 overflow-hidden">
          <Image
            src="/logo-mark.png"
            alt="Logo Khalifa Niaga"
            width={64}
            height={64}
            className="w-full h-full object-contain"
            priority
          />
        </div>
        <h2 className="text-xl font-black">{storeSettings.namaToko}</h2>
        <p className="text-xs text-emerald-100 mt-1">
          Grosir Alat Tulis Kantor, Plastik Kemasan, Rumah Tangga & Kelontong
        </p>
      </div>

      {/* Info Kontak & Alamat */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4 text-xs">
        <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">
          Kontak & Lokasi Toko
        </h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-gray-900">
                Alamat Gudang & Toko Offline:
              </div>
              <div className="text-gray-600 mt-0.5 leading-relaxed">
                {storeSettings.alamatToko}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-gray-900">
                Jam Operasional Pelayanan:
              </div>
              <div className="text-gray-600">
                Senin - Minggu: 07.30 - 17.00 WIB
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-[#25D366] shrink-0" />
            <div>
              <div className="font-bold text-gray-900">
                WhatsApp Resmi Toko:
              </div>
              <div className="text-gray-600 font-mono font-bold text-sm text-primary">
                +{storeSettings.nomorWhatsApp}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center w-full py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
          >
            Chat Langsung dengan CS Toko
          </a>
        </div>
      </div>

      {/* FAQ & Ketentuan Transaksi Grosir */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4 text-xs">
        <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          <span>Ketentuan & Tanya Jawab Kulakan</span>
        </h3>

        <div className="space-y-3 text-gray-600">
          <div>
            <h4 className="font-bold text-gray-900 mb-0.5">
              1. Bagaimana cara pembayarannya?
            </h4>
            <p className="leading-relaxed">
              Setelah pesanan Anda masuk ke WhatsApp kami, admin akan
              mengonfirmasi total barang dan ongkir. Pembayaran dapat ditransfer
              ke rekening bank resmi toko (BCA / Mandiri / BRI) atau tunai saat
              barang diambil langsung.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-0.5">
              2. Bagaimana pengiriman barangnya?
            </h4>
            <p className="leading-relaxed">
              Bisa dikirim via kurir toko (radius terjangkau), ekspedisi kargo
              (Dakota, Indah Cargo, J&T Cargo), atau diambil sendiri ke toko
              grosir kami.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-0.5">
              3. Apakah ada minimal order (MOQ)?
            </h4>
            <p className="leading-relaxed">
              Tidak ada batasan ketat. Anda bisa beli 1 pcs atau 1 dus
              sekalipun. Namun, semakin banyak jumlah yang Anda beli, harga
              satuan yang didapatkan akan semakin murah sesuai tabel harga
              bertingkat.
            </p>
          </div>
        </div>
      </div>

      {/* Pengaturan Cache Perangkat */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-3 text-xs">
        <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-gray-500" />
          <span>Pengaturan Data Aplikasi</span>
        </h3>
        <p className="text-gray-500 leading-relaxed">
          Jika Anda ingin mereset keranjang belanja atau menghapus data toko
          yang tersimpan di perangkat ini:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            onClick={handleClearCache}
            variant="outline"
            size="sm"
            className="text-xs text-red-600 hover:bg-red-50 hover:border-red-200"
          >
            {resetSuccess
              ? "Berhasil Direset!"
              : "Hapus Riwayat Keranjang & Data Saya"}
          </Button>

          <Button
            type="button"
            onClick={async () => {
              const { authClient } = await import("@/lib/auth-client");
              await authClient.signOut();
              window.location.href = "/admin/login";
            }}
            variant="outline"
            size="sm"
            className="text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Logout)</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
