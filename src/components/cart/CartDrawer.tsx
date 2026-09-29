"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatRupiah } from "@/lib/formatters";
import {
  buildWhatsAppMessage,
  createWhatsAppUrl,
  generateOrderNumber,
  DEFAULT_STORE_WHATSAPP,
} from "@/lib/whatsapp";
import { getOrderType, OrderType } from "@/lib/pricing";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import {
  ShoppingCart,
  X,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Zap,
  MessageCircle,
  Store,
  User,
  MapPin,
  FileText,
  Loader2,
  Send,
} from "lucide-react";

interface CartDrawerProps {
  open?: boolean;
  onClose?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  onClose,
}) => {
  const {
    items,
    updateQty,
    removeItem,
    totalItemsCount,
    selectedTotalAmount,
    isCartDrawerOpen,
    cartDrawerMode,
    quickCheckoutItem,
    updateQuickQty,
    closeCartDrawer,
    customerInfo,
    updateCustomerInfo,
    productsMap,
  } = useCart();

  const storeSettings = useStoreSettings();

  const isVisible = open !== undefined ? open : isCartDrawerOpen;
  const handleClose = onClose || closeCartDrawer;

  // Form states for quick checkout
  const [storeName, setStoreName] = useState(customerInfo.storeName || "");
  const [customerName, setCustomerName] = useState(
    customerInfo.customerName || "",
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    customerInfo.whatsappNumber || "",
  );
  const [address, setAddress] = useState(customerInfo.address || "");
  const [notes, setNotes] = useState(customerInfo.notes || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync customerInfo when drawer opens
  useEffect(() => {
    if (isVisible) {
      setStoreName(customerInfo.storeName || "");
      setCustomerName(customerInfo.customerName || "");
      setWhatsappNumber(customerInfo.whatsappNumber || "");
      setAddress(customerInfo.address || "");
      setNotes(customerInfo.notes || "");
      setErrors({});
    }
  }, [isVisible, customerInfo]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const isQuickMode = cartDrawerMode === "quick_checkout" && !!quickCheckoutItem;

  // Determine orderType for quick checkout
  const quickOrderType: OrderType = quickCheckoutItem
    ? getOrderType([quickCheckoutItem], undefined, productsMap)
    : "eceran";

  const validateQuickForm = () => {
    const errs: Record<string, string> = {};
    if (quickOrderType === "grosir" && !storeName.trim()) {
      errs.storeName = "Nama toko / nama usaha wajib diisi untuk pesanan grosir";
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
      errs.address = "Alamat pengiriman wajib diisi";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleQuickOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCheckoutItem) return;
    if (!validateQuickForm()) return;

    setIsSubmitting(true);

    const cleanPhone = whatsappNumber.trim().replace(/[^0-9]/g, "");
    if (typeof window !== "undefined") {
      localStorage.setItem("khalifa_customer_wa", cleanPhone);
    }

    const effectiveStoreName =
      quickOrderType === "grosir" ? storeName.trim() : customerName.trim();

    // Simpan ke customerInfo context & localStorage
    updateCustomerInfo({
      storeName: effectiveStoreName,
      customerName: customerName.trim(),
      whatsappNumber: whatsappNumber.trim(),
      address: address.trim(),
      notes: notes.trim(),
    });

    const orderNumber = generateOrderNumber();

    // Simpan pesanan ke database secara asynchronous untuk rekam jejak
    const orderPayloadItems = [
      {
        productVariantId:
          quickCheckoutItem.variantId || quickCheckoutItem.productId,
        jenisKemasan: quickCheckoutItem.unitType.toLowerCase() as "pcs" | "pak",
        qty: quickCheckoutItem.qty,
      },
    ];

    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        namaToko: effectiveStoreName,
        namaPemesan: customerName.trim(),
        noWhatsApp: cleanPhone,
        alamat: address.trim(),
        catatan: notes.trim() || undefined,
        items: orderPayloadItems,
      }),
    }).catch((err) => console.error("Gagal simpan pesanan cepat ke DB:", err));

    // Bangun pesan WhatsApp HANYA untuk 1 barang ini
    const message = buildWhatsAppMessage(
      orderNumber,
      {
        storeName: quickOrderType === "grosir" ? storeName.trim() : "",
        customerName: customerName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        address: address.trim(),
        notes: notes.trim(),
      },
      [quickCheckoutItem],
      quickCheckoutItem.subtotal,
      quickOrderType,
      storeSettings.namaToko,
    );

    const waPhone = storeSettings.nomorWhatsApp || DEFAULT_STORE_WHATSAPP;
    const waUrl = createWhatsAppUrl(waPhone, message);

    // Buka WhatsApp
    window.open(waUrl, "_blank");

    setIsSubmitting(false);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer Container (Bottom Sheet on mobile, Right Drawer on desktop) */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto max-h-[92vh] sm:max-h-none sm:w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-none shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E5E7EB] bg-[#146C43] text-white rounded-t-2xl sm:rounded-none shrink-0">
          <div className="flex items-center gap-2">
            {isQuickMode ? (
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" strokeWidth={2} />
            ) : (
              <ShoppingCart className="w-5 h-5 text-white" strokeWidth={2} />
            )}
            <h2 className="font-heading font-semibold text-base">
              {isQuickMode ? "Checkout Langsung" : "Keranjang Belanja"}
            </h2>
            <span className="bg-white/20 text-white font-sans text-xs px-2 py-0.5 rounded-full font-bold">
              {isQuickMode ? "1 Barang" : totalItemsCount}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Content Body */}
        {isQuickMode && quickCheckoutItem ? (
          // ==================== MODE QUICK CHECKOUT ====================
          <form
            onSubmit={handleQuickOrderSubmit}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Ringkasan 1 Barang */}
              <div className="p-3 bg-[#F5F7F6] rounded-xl border border-[#E5E7EB] space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-sans font-bold text-[#146C43] bg-emerald-100 px-2 py-0.5 rounded">
                      BELI CEPAT 1 PRODUK
                    </span>
                    <h4 className="font-heading font-medium text-[14px] text-[#1A1A1A] mt-1">
                      {quickCheckoutItem.productName}
                    </h4>
                    {quickCheckoutItem.variantName &&
                      quickCheckoutItem.variantName !== "Standar" && (
                        <p className="font-sans text-[11px] text-[#6B7280] mt-0.5">
                          Varian:{" "}
                          <span className="font-medium text-[#146C43]">
                            {quickCheckoutItem.variantName}
                          </span>
                        </p>
                      )}
                  </div>

                  {/* Stepper jumlah */}
                  <div className="flex items-center h-8 border border-[#E5E7EB] rounded-lg overflow-hidden bg-white shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuickQty(Math.max(1, quickCheckoutItem.qty - 1))
                      }
                      className="w-7 h-full flex items-center justify-center text-[#6B7280] hover:bg-[#F5F7F6] hover:text-[#1A1A1A] select-none text-xs font-bold"
                      aria-label="Kurangi jumlah"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-heading text-xs font-bold text-[#1A1A1A]">
                      {quickCheckoutItem.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuickQty(quickCheckoutItem.qty + 1)
                      }
                      className="w-7 h-full flex items-center justify-center text-[#6B7280] hover:bg-[#F5F7F6] hover:text-[#1A1A1A] select-none text-xs font-bold"
                      aria-label="Tambah jumlah"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E5E7EB]">
                  <span className="font-sans text-[12px] text-[#6B7280]">
                    {quickCheckoutItem.qty} {quickCheckoutItem.unitType.toLowerCase()} ×{" "}
                    {formatRupiah(quickCheckoutItem.unitPrice)}
                  </span>
                  <span className="font-heading font-bold text-[#146C43] text-[16px]">
                    {formatRupiah(quickCheckoutItem.subtotal)}
                  </span>
                </div>
              </div>

              {/* Form Data Pemesan */}
              <div className="space-y-3 bg-white p-3.5 rounded-xl border border-[#E5E7EB]">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                  <div className="flex items-center gap-1.5 font-heading text-xs font-semibold text-[#1A1A1A]">
                    <User className="w-4 h-4 text-[#146C43]" strokeWidth={2} />
                    <span>Data Pengiriman</span>
                  </div>
                  <span
                    className={`font-sans text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      quickOrderType === "grosir"
                        ? "bg-emerald-100 text-[#146C43]"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {quickOrderType === "grosir"
                      ? "Tarif Grosir"
                      : "Tarif Eceran"}
                  </span>
                </div>

                {/* Nama Toko (jika grosir) */}
                {quickOrderType === "grosir" && (
                  <div className="space-y-1">
                    <label className="font-sans text-[11px] font-medium text-[#1A1A1A] flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                      <span>Nama Toko / Usaha</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Toko Berkah Mandiri"
                      value={storeName}
                      onChange={(e) => {
                        setStoreName(e.target.value);
                        if (errors.storeName) setErrors({ ...errors, storeName: "" });
                      }}
                      className={`w-full font-sans text-xs px-3 py-2 rounded-lg border outline-none transition-colors ${
                        errors.storeName
                          ? "border-red-400 focus:border-red-500 bg-red-50/20"
                          : "border-[#E5E7EB] focus:border-[#146C43] bg-[#F5F7F6]"
                      }`}
                    />
                    {errors.storeName && (
                      <p className="font-sans text-[10px] text-red-500 font-medium">
                        {errors.storeName}
                      </p>
                    )}
                  </div>
                )}

                {/* Nama Pemesan */}
                <div className="space-y-1">
                  <label className="font-sans text-[11px] font-medium text-[#1A1A1A] flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                    <span>Nama Pemesan</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.customerName)
                        setErrors({ ...errors, customerName: "" });
                    }}
                    className={`w-full font-sans text-xs px-3 py-2 rounded-lg border outline-none transition-colors ${
                      errors.customerName
                        ? "border-red-400 focus:border-red-500 bg-red-50/20"
                        : "border-[#E5E7EB] focus:border-[#146C43] bg-[#F5F7F6]"
                    }`}
                  />
                  {errors.customerName && (
                    <p className="font-sans text-[10px] text-red-500 font-medium">
                      {errors.customerName}
                    </p>
                  )}
                </div>

                {/* No WhatsApp */}
                <div className="space-y-1">
                  <label className="font-sans text-[11px] font-medium text-[#1A1A1A] flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                    <span>No. WhatsApp Aktif</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    value={whatsappNumber}
                    onChange={(e) => {
                      setWhatsappNumber(e.target.value);
                      if (errors.whatsappNumber)
                        setErrors({ ...errors, whatsappNumber: "" });
                    }}
                    className={`w-full font-sans text-xs px-3 py-2 rounded-lg border outline-none transition-colors ${
                      errors.whatsappNumber
                        ? "border-red-400 focus:border-red-500 bg-red-50/20"
                        : "border-[#E5E7EB] focus:border-[#146C43] bg-[#F5F7F6]"
                    }`}
                  />
                  {errors.whatsappNumber && (
                    <p className="font-sans text-[10px] text-red-500 font-medium">
                      {errors.whatsappNumber}
                    </p>
                  )}
                </div>

                {/* Alamat Pengiriman */}
                <div className="space-y-1">
                  <label className="font-sans text-[11px] font-medium text-[#1A1A1A] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                    <span>Alamat Lengkap Pengiriman</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Alamat jalan, kelurahan, kecamatan, patokan lokasi..."
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors({ ...errors, address: "" });
                    }}
                    className={`w-full font-sans text-xs px-3 py-2 rounded-lg border outline-none transition-colors resize-none ${
                      errors.address
                        ? "border-red-400 focus:border-red-500 bg-red-50/20"
                        : "border-[#E5E7EB] focus:border-[#146C43] bg-[#F5F7F6]"
                    }`}
                  />
                  {errors.address && (
                    <p className="font-sans text-[10px] text-red-500 font-medium">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Catatan (Opsional) */}
                <div className="space-y-1">
                  <label className="font-sans text-[11px] font-medium text-[#1A1A1A] flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                    <span>Catatan Tambahan (Opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Minta dikemas rapat / antar sore"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full font-sans text-xs px-3 py-2 rounded-lg border border-[#E5E7EB] focus:border-[#146C43] bg-[#F5F7F6] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer Quick Checkout */}
            <div className="p-4 border-t border-[#E5E7EB] bg-white space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="font-sans text-[13px] text-[#6B7280]">Total Pembelian:</span>
                <span className="font-heading font-bold text-[16px] text-[#146C43]">
                  {formatRupiah(quickCheckoutItem.subtotal)}
                </span>
              </div>

              {/* Tombol Kirim: height 44px, rounded-xl, background var(--primary), teks putih 14px medium */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[44px] bg-[#146C43] hover:bg-[#0f5333] active:scale-[0.99] text-white rounded-xl font-heading font-medium text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" strokeWidth={2} />
                )}
                <span>Kirim Pesanan ke WhatsApp</span>
              </button>
              <p className="font-sans text-[11px] text-center text-[#6B7280]">
                Pemesanan langsung diproses tanpa mengganggu keranjang belanja.
              </p>
            </div>
          </form>
        ) : (
          // ==================== MODE STANDARD CART ====================
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#146C43] flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8" strokeWidth={2} />
                  </div>
                  <p className="font-heading font-semibold text-sm text-[#1A1A1A]">
                    Keranjang Anda masih kosong
                  </p>
                  <p className="font-sans text-xs text-[#6B7280]">
                    Pilih produk dan tentukan jumlah untuk mulai belanja grosir.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-[#F5F7F6] rounded-xl border border-[#E5E7EB]"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-medium text-[13px] text-[#1A1A1A] truncate">
                        {item.productName}
                      </h4>
                      {item.variantName && item.variantName !== "Standar" && (
                        <p className="font-sans text-[11px] text-[#6B7280]">
                          Varian: {item.variantName}
                        </p>
                      )}
                      <p className="font-heading font-bold text-[14px] text-[#146C43] mt-0.5">
                        {formatRupiah(item.subtotal)}
                      </p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center h-8 border border-[#E5E7EB] rounded-lg overflow-hidden bg-white shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-7 h-full flex items-center justify-center text-[#6B7280] hover:bg-[#F5F7F6] hover:text-[#1A1A1A] select-none text-xs font-bold cursor-pointer"
                        aria-label="Kurangi jumlah"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-heading text-xs font-bold text-[#1A1A1A]">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-7 h-full flex items-center justify-center text-[#6B7280] hover:bg-[#F5F7F6] hover:text-[#1A1A1A] select-none text-xs font-bold cursor-pointer"
                        aria-label="Tambah jumlah"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-[#6B7280] hover:text-red-500 p-1 cursor-pointer transition-colors"
                      aria-label="Hapus item"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Standard Cart */}
            {items.length > 0 && (
              <div className="p-4 border-t border-[#E5E7EB] bg-white space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[13px] text-[#6B7280]">Total Pembelian:</span>
                  <span className="font-heading font-bold text-[16px] text-[#1A1A1A]">
                    {formatRupiah(selectedTotalAmount)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/keranjang"
                    onClick={handleClose}
                    className="flex-1 h-[44px] border border-[#146C43] rounded-xl font-heading font-medium text-[14px] text-[#146C43] flex items-center justify-center hover:bg-emerald-50 transition-colors"
                  >
                    Lihat Detail
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={handleClose}
                    className="flex-2 h-[44px] bg-[#146C43] hover:bg-[#0f5333] text-white rounded-xl font-heading font-medium text-[14px] flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span>Pesan Sekarang</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
