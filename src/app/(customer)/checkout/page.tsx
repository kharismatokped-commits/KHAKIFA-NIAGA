"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatRupiah } from "@/lib/formatters";
import {
  buildWhatsAppMessage,
  createWhatsAppUrl,
  generateOrderNumber,
  DEFAULT_STORE_WHATSAPP,
  STORE_NAME,
} from "@/lib/whatsapp";
import { getOrderType, OrderType } from "@/lib/pricing";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { WhatsAppPreview } from "@/components/cart/WhatsAppPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Store,
  User,
  Phone,
  MapPin,
  FileText,
  MessageCircle,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, selectedTotalAmount, customerInfo, updateCustomerInfo, productsMap } = useCart();
  const storeSettings = useStoreSettings();
  const selectedItems = items.filter((item) => item.selected);
  const orderType: OrderType = getOrderType(selectedItems, undefined, productsMap);

  const [orderNumber] = useState(() => generateOrderNumber());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState(customerInfo.storeName || "");
  const [customerName, setCustomerName] = useState(customerInfo.customerName || "");
  const [whatsappNumber, setWhatsappNumber] = useState(customerInfo.whatsappNumber || "");
  const [address, setAddress] = useState(customerInfo.address || "");
  const [notes, setNotes] = useState(customerInfo.notes || "");

  // Generate live WhatsApp message text (mengikuti orderType)
  const currentMessageText = buildWhatsAppMessage(
    orderNumber,
    {
      storeName: storeName || "[Nama Toko Belum Diisi]",
      customerName: customerName || "[Nama Pemesan]",
      whatsappNumber: whatsappNumber || "[Nomor WhatsApp]",
      address: address || "[Alamat Belum Diisi]",
      notes: notes,
    },
    selectedItems,
    selectedTotalAmount,
    orderType,
    storeSettings.namaToko
  );

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!storeName.trim()) {
      errs.storeName = "Nama toko / nama usaha wajib diisi";
    }
    if (!customerName.trim()) {
      errs.customerName = "Nama pemesan wajib diisi";
    }
    if (!whatsappNumber.trim()) {
      errs.whatsappNumber = "Nomor WhatsApp aktif wajib diisi";
    } else if (whatsappNumber.replace(/[^0-9]/g, "").length < 9) {
      errs.whatsappNumber = "Nomor WhatsApp tidak valid (minimal 9 digit)";
    }
    if (!address.trim()) {
      errs.address = "Alamat pengiriman / patokan lokasi wajib diisi";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    // Save to context / localStorage for next orders
    updateCustomerInfo({
      storeName: storeName.trim(),
      customerName: customerName.trim(),
      whatsappNumber: whatsappNumber.trim(),
      address: address.trim(),
      notes: notes.trim(),
    });

    const finalMessage = buildWhatsAppMessage(
      orderNumber,
      {
        storeName: storeName.trim(),
        customerName: customerName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        address: address.trim(),
        notes: notes.trim(),
      },
      selectedItems,
      selectedTotalAmount,
      orderType,
      storeSettings.namaToko
    );

    const waUrl = createWhatsAppUrl(storeSettings.nomorWhatsApp, finalMessage);

    // Buka WhatsApp di tab baru
    window.open(waUrl, "_blank");
    setIsSubmitting(false);
  };

  if (selectedItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-md mx-auto space-y-4 my-8">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" strokeWidth={2} />
        <h2 className="text-lg font-bold text-gray-900">
          Tidak ada barang terpilih untuk checkout
        </h2>
        <p className="text-xs text-gray-500">
          Silakan centang barang yang ingin Anda pesan di halaman keranjang terlebih dahulu.
        </p>
        <Link href="/keranjang">
          <Button size="default" className="text-xs font-bold">
            Kembali ke Keranjang
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-12">
      {/* Header Form */}
      <div className="flex items-center gap-3">
        <Link
          href="/keranjang"
          className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.2} />
        </Link>
        <div>
          {/* (a) Teks Judul Form Dinamis: "Form Pemesanan" (Eceran) vs "Form Pemesanan Grosir" */}
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {orderType === "grosir" ? "Form Pemesanan Grosir" : "Form Pemesanan"}
          </h2>
          {/* (b) Teks Subjudul Dinamis */}
          <p className="text-xs text-gray-500">
            {orderType === "grosir"
              ? `Pesanan grosir #${orderNumber} akan langsung diteruskan ke WhatsApp ${STORE_NAME}`
              : `Pesanan #${orderNumber} akan langsung diteruskan ke WhatsApp ${STORE_NAME}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Form Data Pemesan */}
        <form onSubmit={handleSendToWhatsApp} className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
              <Store className="w-4 h-4 text-[#146C43]" />
              <span>Data Toko & Pemesan</span>
            </h3>

            {/* Nama Toko */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <span>Nama Toko / Usaha</span>
                <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: Toko Berkah Mandiri / Warung Bu Siti"
                value={storeName}
                onChange={(e) => {
                  setStoreName(e.target.value);
                  if (errors.storeName) setErrors({ ...errors, storeName: "" });
                }}
                className={errors.storeName ? "border-red-400 focus-visible:ring-red-400" : ""}
              />
              {errors.storeName && (
                <p className="text-[11px] text-red-500 font-medium">{errors.storeName}</p>
              )}
            </div>

            {/* Nama Pemesan (1 Kolom per Baris) */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1">
                <span>Nama Pemilik / Pemesan</span>
                <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: Bpk. Ahmad Subarjo"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errors.customerName) setErrors({ ...errors, customerName: "" });
                }}
                className={errors.customerName ? "border-red-400 focus-visible:ring-red-400" : ""}
              />
              {errors.customerName && (
                <p className="text-[11px] text-red-500 font-medium">{errors.customerName}</p>
              )}
            </div>

            {/* No WA (1 Kolom per Baris) */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1">
                <span>No. WhatsApp Aktif</span>
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                placeholder="Contoh: 081234567890"
                value={whatsappNumber}
                onChange={(e) => {
                  setWhatsappNumber(e.target.value);
                  if (errors.whatsappNumber) setErrors({ ...errors, whatsappNumber: "" });
                }}
                className={errors.whatsappNumber ? "border-red-400 focus-visible:ring-red-400" : ""}
              />
              {errors.whatsappNumber && (
                <p className="text-[11px] text-red-500 font-medium">{errors.whatsappNumber}</p>
              )}
            </div>

            {/* Alamat Pengiriman */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <span>Alamat Lengkap Pengiriman (atau Patokan Lokasi Toko)</span>
                <span className="text-red-500">*</span>
              </label>
              <Textarea
                rows={3}
                placeholder="Jl. Raya Sukamaju No. 15 RT 02/RW 04, Sebelah Masjid Al-Ikhlas, Kec. Cibinong, Kab. Bogor"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors({ ...errors, address: "" });
                }}
                className={errors.address ? "border-red-400 focus-visible:ring-red-400" : ""}
              />
              {errors.address && (
                <p className="text-[11px] text-red-500 font-medium">{errors.address}</p>
              )}
            </div>

            {/* Catatan Tambahan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <span>Catatan untuk Toko (Opsional)</span>
              </label>
              <Input
                placeholder="Contoh: Minta warna hitam semua / dikirim hari Sabtu"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Rincian Ringkas Barang */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
            {/* (c) Badge kecil di ringkasan pesanan yang menunjukkan jenis pesanan */}
            <div className="flex items-center justify-between pb-1">
              <h4 className="text-xs font-bold text-gray-700">
                Daftar Barang ({selectedItems.length} Macam Produk):
              </h4>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  orderType === "grosir"
                    ? "bg-emerald-100 text-[#146C43] border border-emerald-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {orderType === "grosir" ? "Pesanan Grosir" : "Pesanan Eceran"}
              </span>
            </div>
            <div className="divide-y divide-gray-100 text-xs">
              {selectedItems.map((item, idx) => (
                <div key={item.id} className="py-2 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-gray-900 truncate">
                      {idx + 1}. {item.productName}
                      {item.variantName ? ` (${item.variantName})` : ""}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {item.qty} {item.unitType}{" "}
                      {item.unitType === "PAK" && `(isi ${item.packRatio})`} × {formatRupiah(item.unitPrice)}
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
              <span className="text-[13px] font-bold text-gray-700">Total Belanja:</span>
              <span className="font-price text-[16px] sm:text-[18px] font-bold text-[#146C43]">
                {formatRupiah(selectedTotalAmount)}
              </span>
            </div>
          </div>

          {/* Tombol Kirim Pesanan Utama (Desktop / Tablet) */}
          <div className="hidden sm:block">
            <Button
              type="submit"
              size="lg"
              className="w-full min-h-[52px] h-14 text-[13px] sm:text-[14px] font-heading font-medium shadow-lg rounded-xl flex items-center justify-center gap-2 bg-[#146C43] hover:bg-[#115b38] text-white"
              disabled={isSubmitting}
            >
              <MessageCircle className="w-5 h-5" strokeWidth={2.2} />
              <span>
                {orderType === "grosir" ? "Pesan Grosir lewat WhatsApp" : "Pesan lewat WhatsApp"} (+{DEFAULT_STORE_WHATSAPP})
              </span>
            </Button>
            <p className="text-[12px] text-center text-gray-500 mt-2 font-normal">
              Tidak ada pembayaran di web. Pembayaran & ongkir dikonfirmasi manual via WhatsApp.
            </p>
          </div>
        </form>

        {/* Kolom Kanan: Live Preview Tampilan Pesan WhatsApp */}
        <div className="lg:col-span-5 space-y-3 sticky top-24">
          <div className="flex items-center justify-between">
            <span className="text-[12px] sm:text-[13px] font-medium text-gray-800 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-[#146C43]" strokeWidth={2.2} />
              <span>Pratinjau Pesan yang Diterima Toko:</span>
            </span>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
              0% Selisih
            </span>
          </div>

          <WhatsAppPreview messageText={currentMessageText} />

          {/* Tombol Kirim Pesanan (Mobile Fixed Bottom Bar) */}
          <div className="sm:hidden fixed bottom-16 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl z-30">
            <Button
              type="button"
              onClick={handleSendToWhatsApp}
              size="lg"
              className="w-full min-h-[48px] h-12 text-[13px] sm:text-[14px] font-heading font-medium rounded-xl shadow-md bg-[#146C43] hover:bg-[#115b38] text-white"
            >
              <MessageCircle className="w-5 h-5 mr-1.5" strokeWidth={2.2} />
              <span>
                {orderType === "grosir" ? "Pesan Grosir lewat WhatsApp" : "Pesan lewat WhatsApp"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
