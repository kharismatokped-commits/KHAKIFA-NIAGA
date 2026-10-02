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

/* ── CSS-in-JS style tokens (shared) ── */
const NM_CARD = "8px 8px 18px rgba(163,177,198,0.28), -6px -6px 16px rgba(255,255,255,0.90)";
const NM_OUT  = "6px 6px 14px rgba(163,177,198,0.28), -5px -5px 12px rgba(255,255,255,0.90)";
const NM_IN   = "inset 4px 4px 9px rgba(163,177,198,0.28), inset -4px -4px 9px rgba(255,255,255,0.92)";
const NM_IN_ERR = "inset 4px 4px 9px rgba(229,72,77,0.12), inset -4px -4px 9px rgba(255,255,255,0.92)";

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

      {/* ── Drawer Container ── */}
      <div
        className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto max-h-[92vh] sm:max-h-none sm:w-full sm:max-w-md flex flex-col z-50 animate-in slide-in-from-bottom sm:slide-in-from-right duration-200"
        style={{
          background: "#EEF0F8",
          borderRadius: "28px 28px 0 0",
          boxShadow: "0 -12px 40px rgba(163,177,198,0.34), 0 0 0 1px rgba(255,255,255,0.60)",
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div
            className="rounded-full"
            style={{ width: "36px", height: "4px", background: "#C8CEDD" }}
          />
        </div>

        {/* ── HEADER: terang, tanpa background hijau pekat ── */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ borderBottom: "1px solid rgba(226,230,242,0.6)" }}
        >
          <div className="flex items-center gap-2">
            {isQuickMode ? (
              <Zap
                style={{ width: "20px", height: "20px", color: "#146C43", fill: "rgba(20,108,67,0.15)" }}
                strokeWidth={2}
              />
            ) : (
              <ShoppingCart style={{ width: "20px", height: "20px", color: "#146C43" }} strokeWidth={2} />
            )}
            <h2 className="font-heading font-bold text-[16px] text-[#1F2340]">
              {isQuickMode ? "Checkout Langsung" : "Keranjang Belanja"}
            </h2>
            {/* Badge kapsul timbul */}
            <span
              className="font-sans text-[11px] font-bold text-[#146C43] px-2.5 py-0.5"
              style={{
                borderRadius: "20px",
                background: "#F8F9FE",
                boxShadow: NM_OUT,
              }}
            >
              {isQuickMode ? "1 Barang" : `${totalItemsCount} Item`}
            </span>
          </div>

          {/* Tombol tutup — bulat timbul */}
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            style={{
              width: "34px", height: "34px", borderRadius: "50%",
              background: "#F8F9FE", boxShadow: NM_OUT,
              color: "#8A8FA8",
            }}
            aria-label="Tutup"
          >
            <X style={{ width: "16px", height: "16px" }} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content Body */}
        {isQuickMode && quickCheckoutItem ? (
          // ==================== MODE QUICK CHECKOUT ====================
          <form
            onSubmit={handleQuickOrderSubmit}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ paddingBottom: "8px" }}>

              {/* ── Kartu Ringkasan Produk ── */}
              <div
                className="rounded-[20px] p-4"
                style={{ background: "#F8F9FE", boxShadow: NM_CARD }}
              >
                {/* Badge "BELI CEPAT 1 PRODUK" */}
                <span
                  className="font-sans text-[10px] font-bold inline-block px-2.5 py-0.5 mb-2"
                  style={{
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, rgba(46,155,99,0.12), rgba(20,108,67,0.08))",
                    color: "#146C43",
                  }}
                >
                  BELI CEPAT 1 PRODUK
                </span>

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-heading font-semibold text-[14px] text-[#1F2340] leading-snug">
                      {quickCheckoutItem.productName}
                    </h4>
                    {quickCheckoutItem.variantName &&
                      quickCheckoutItem.variantName !== "Standar" && (
                        <p className="font-sans text-[12px] text-[#8A8FA8] mt-0.5">
                          Varian:{" "}
                          <span className="font-semibold text-[#146C43]">
                            {quickCheckoutItem.variantName}
                          </span>
                        </p>
                      )}
                  </div>

                  {/* Stepper kapsul timbul */}
                  <div
                    className="flex items-center shrink-0"
                    style={{
                      height: "38px", borderRadius: "19px",
                      background: "#F8F9FE", boxShadow: NM_OUT,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => updateQuickQty(Math.max(1, quickCheckoutItem.qty - 1))}
                      className="flex items-center justify-center text-[#146C43] font-bold select-none cursor-pointer"
                      style={{ width: "34px", height: "34px", borderRadius: "50%", fontSize: "16px", marginLeft: "2px" }}
                      aria-label="Kurangi jumlah"
                    >
                      −
                    </button>
                    <span className="font-heading font-bold text-[14px] text-[#1F2340] px-1 min-w-[24px] text-center">
                      {quickCheckoutItem.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuickQty(quickCheckoutItem.qty + 1)}
                      className="flex items-center justify-center text-[#146C43] font-bold select-none cursor-pointer"
                      style={{ width: "34px", height: "34px", borderRadius: "50%", fontSize: "16px", marginRight: "2px" }}
                      aria-label="Tambah jumlah"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Pemisah tipis */}
                <div style={{ height: "1px", background: "#E2E6F2", margin: "12px 0" }} />

                <div className="flex items-center justify-between">
                  <span className="font-sans text-[12px] text-[#8A8FA8]">
                    {quickCheckoutItem.qty} {quickCheckoutItem.unitType.toLowerCase()} × {formatRupiah(quickCheckoutItem.unitPrice)}
                  </span>
                  <span className="font-heading font-bold text-[16px] text-[#146C43]">
                    {formatRupiah(quickCheckoutItem.subtotal)}
                  </span>
                </div>
              </div>

              {/* ── Kartu Form Data Pengiriman ── */}
              <div
                className="rounded-[20px] p-4 space-y-4"
                style={{ background: "#F8F9FE", boxShadow: NM_CARD }}
              >
                {/* Header kartu */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User style={{ width: "16px", height: "16px", color: "#146C43" }} strokeWidth={2} />
                    <span className="font-heading font-bold text-[13px] text-[#1F2340]">
                      Data Pengiriman
                    </span>
                  </div>
                  {/* Badge Tarif — kapsul biru lembut */}
                  <span
                    className="font-sans text-[10px] font-bold px-2.5 py-0.5"
                    style={{
                      borderRadius: "20px",
                      background: quickOrderType === "grosir"
                        ? "rgba(46,155,99,0.10)"
                        : "rgba(59,130,246,0.10)",
                      color: quickOrderType === "grosir" ? "#146C43" : "#2563EB",
                    }}
                  >
                    {quickOrderType === "grosir" ? "Tarif Grosir" : "Tarif Eceran"}
                  </span>
                </div>

                {/* Nama Toko (jika grosir) */}
                {quickOrderType === "grosir" && (
                  <div className="space-y-2">
                    <label className="font-sans text-[11px] font-semibold text-[#1F2340] flex items-center gap-1.5">
                      <Store style={{ width: "13px", height: "13px", color: "#8A8FA8" }} strokeWidth={2} />
                      <span>Nama Toko / Usaha</span>
                      <span style={{ color: "#E5484D" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Toko Berkah Mandiri"
                      value={storeName}
                      onChange={(e) => {
                        setStoreName(e.target.value);
                        if (errors.storeName) setErrors({ ...errors, storeName: "" });
                      }}
                      className="w-full font-sans text-[13px] text-[#1F2340] placeholder:text-[#B0B4C0] outline-none transition-all"
                      style={{
                        padding: "13px 16px",
                        borderRadius: "14px",
                        border: "none",
                        background: errors.storeName ? "rgba(229,72,77,0.04)" : "#E9ECF6",
                        boxShadow: errors.storeName ? NM_IN_ERR : NM_IN,
                      }}
                      onFocus={(e) => {
                        e.target.style.boxShadow = "inset 5px 5px 12px rgba(163,177,198,0.32), inset -5px -5px 12px rgba(255,255,255,0.95), 0 0 0 2px rgba(46,155,99,0.25)";
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = errors.storeName ? NM_IN_ERR : NM_IN;
                      }}
                    />
                    {errors.storeName && (
                      <p className="font-sans text-[10px] font-medium" style={{ color: "#E5484D" }}>
                        {errors.storeName}
                      </p>
                    )}
                  </div>
                )}

                {/* Nama Pemesan */}
                <div className="space-y-2">
                  <label className="font-sans text-[11px] font-semibold text-[#1F2340] flex items-center gap-1.5">
                    <User style={{ width: "13px", height: "13px", color: "#8A8FA8" }} strokeWidth={2} />
                    <span>Nama Pemesan</span>
                    <span style={{ color: "#E5484D" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.customerName) setErrors({ ...errors, customerName: "" });
                    }}
                    className="w-full font-sans text-[13px] text-[#1F2340] placeholder:text-[#B0B4C0] outline-none transition-all"
                    style={{
                      padding: "13px 16px",
                      borderRadius: "14px",
                      border: "none",
                      background: errors.customerName ? "rgba(229,72,77,0.04)" : "#E9ECF6",
                      boxShadow: errors.customerName ? NM_IN_ERR : NM_IN,
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = "inset 5px 5px 12px rgba(163,177,198,0.32), inset -5px -5px 12px rgba(255,255,255,0.95), 0 0 0 2px rgba(46,155,99,0.25)";
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = errors.customerName ? NM_IN_ERR : NM_IN;
                    }}
                  />
                  {errors.customerName && (
                    <p className="font-sans text-[10px] font-medium" style={{ color: "#E5484D" }}>
                      {errors.customerName}
                    </p>
                  )}
                </div>

                {/* No WhatsApp */}
                <div className="space-y-2">
                  <label className="font-sans text-[11px] font-semibold text-[#1F2340] flex items-center gap-1.5">
                    <MessageCircle style={{ width: "13px", height: "13px", color: "#8A8FA8" }} strokeWidth={2} />
                    <span>No. WhatsApp Aktif</span>
                    <span style={{ color: "#E5484D" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    value={whatsappNumber}
                    onChange={(e) => {
                      setWhatsappNumber(e.target.value);
                      if (errors.whatsappNumber) setErrors({ ...errors, whatsappNumber: "" });
                    }}
                    className="w-full font-sans text-[13px] text-[#1F2340] placeholder:text-[#B0B4C0] outline-none transition-all"
                    style={{
                      padding: "13px 16px",
                      borderRadius: "14px",
                      border: "none",
                      background: errors.whatsappNumber ? "rgba(229,72,77,0.04)" : "#E9ECF6",
                      boxShadow: errors.whatsappNumber ? NM_IN_ERR : NM_IN,
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = "inset 5px 5px 12px rgba(163,177,198,0.32), inset -5px -5px 12px rgba(255,255,255,0.95), 0 0 0 2px rgba(46,155,99,0.25)";
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = errors.whatsappNumber ? NM_IN_ERR : NM_IN;
                    }}
                  />
                  {errors.whatsappNumber && (
                    <p className="font-sans text-[10px] font-medium" style={{ color: "#E5484D" }}>
                      {errors.whatsappNumber}
                    </p>
                  )}
                </div>

                {/* Alamat Pengiriman */}
                <div className="space-y-2">
                  <label className="font-sans text-[11px] font-semibold text-[#1F2340] flex items-center gap-1.5">
                    <MapPin style={{ width: "13px", height: "13px", color: "#8A8FA8" }} strokeWidth={2} />
                    <span>Alamat Lengkap Pengiriman</span>
                    <span style={{ color: "#E5484D" }}>*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Alamat jalan, kelurahan, kecamatan, patokan lokasi..."
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors({ ...errors, address: "" });
                    }}
                    className="w-full font-sans text-[13px] text-[#1F2340] placeholder:text-[#B0B4C0] outline-none resize-none transition-all"
                    style={{
                      padding: "13px 16px",
                      borderRadius: "14px",
                      border: "none",
                      background: errors.address ? "rgba(229,72,77,0.04)" : "#E9ECF6",
                      boxShadow: errors.address ? NM_IN_ERR : NM_IN,
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = "inset 5px 5px 12px rgba(163,177,198,0.32), inset -5px -5px 12px rgba(255,255,255,0.95), 0 0 0 2px rgba(46,155,99,0.25)";
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = errors.address ? NM_IN_ERR : NM_IN;
                    }}
                  />
                  {errors.address && (
                    <p className="font-sans text-[10px] font-medium" style={{ color: "#E5484D" }}>
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Catatan (Opsional) */}
                <div className="space-y-2">
                  <label className="font-sans text-[11px] font-semibold text-[#1F2340] flex items-center gap-1.5">
                    <FileText style={{ width: "13px", height: "13px", color: "#8A8FA8" }} strokeWidth={2} />
                    <span>Catatan Tambahan (Opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Minta dikemas rapat / antar sore"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full font-sans text-[13px] text-[#1F2340] placeholder:text-[#B0B4C0] outline-none transition-all"
                    style={{
                      padding: "13px 16px",
                      borderRadius: "14px",
                      border: "none",
                      background: "#E9ECF6",
                      boxShadow: NM_IN,
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = "inset 5px 5px 12px rgba(163,177,198,0.32), inset -5px -5px 12px rgba(255,255,255,0.95), 0 0 0 2px rgba(46,155,99,0.25)";
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = NM_IN;
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ── Footer Sticky — Total + Tombol Kirim ── */}
            <div
              className="px-4 pt-3 pb-4 shrink-0 space-y-3"
              style={{
                borderTop: "1px solid rgba(226,230,242,0.60)",
                background: "#EEF0F8",
              }}
            >
              {/* Total baris */}
              <div
                className="flex items-center justify-between px-4 py-3 rounded-[16px]"
                style={{ background: "#F8F9FE", boxShadow: NM_OUT }}
              >
                <span className="font-sans text-[13px] text-[#8A8FA8]">Total Pembelian:</span>
                <span className="font-heading font-bold text-[20px] text-[#146C43]">
                  {formatRupiah(quickCheckoutItem.subtotal)}
                </span>
              </div>

              {/* Tombol Kirim — gradien hijau + glow + efek tekan */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 font-heading font-semibold text-white transition-all active:scale-[0.98] cursor-pointer"
                style={{
                  height: "52px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #2E9B63, #146C43)",
                  boxShadow: "0 12px 28px rgba(20,108,67,0.36)",
                  fontSize: "15px",
                }}
              >
                {isSubmitting ? (
                  <Loader2 style={{ width: "20px", height: "20px" }} className="animate-spin" />
                ) : (
                  <Send style={{ width: "18px", height: "18px" }} strokeWidth={2} />
                )}
                <span>Kirim Pesanan ke WhatsApp</span>
              </button>

              <p className="font-sans text-[11px] text-center text-[#8A8FA8]">
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
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                    style={{ background: "#F8F9FE", boxShadow: NM_OUT }}
                  >
                    <ShoppingBag style={{ width: "32px", height: "32px", color: "#146C43" }} strokeWidth={2} />
                  </div>
                  <p className="font-heading font-semibold text-sm text-[#1F2340]">
                    Keranjang Anda masih kosong
                  </p>
                  <p className="font-sans text-xs text-[#8A8FA8]">
                    Pilih produk dan tentukan jumlah untuk mulai belanja grosir.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-[18px]"
                    style={{ background: "#F8F9FE", boxShadow: NM_CARD }}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-semibold text-[13px] text-[#1F2340] truncate">
                        {item.productName}
                      </h4>
                      {item.variantName && item.variantName !== "Standar" && (
                        <p className="font-sans text-[11px] text-[#8A8FA8]">
                          Varian: <span className="text-[#146C43] font-medium">{item.variantName}</span>
                        </p>
                      )}
                      <p className="font-heading font-bold text-[14px] text-[#146C43] mt-0.5">
                        {formatRupiah(item.subtotal)}
                      </p>
                    </div>

                    {/* Stepper */}
                    <div
                      className="flex items-center shrink-0"
                      style={{ height: "36px", borderRadius: "18px", background: "#F8F9FE", boxShadow: NM_OUT }}
                    >
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="flex items-center justify-center text-[#146C43] font-bold select-none cursor-pointer"
                        style={{ width: "32px", height: "32px", borderRadius: "50%", fontSize: "15px", marginLeft: "2px" }}
                        aria-label="Kurangi jumlah"
                      >
                        −
                      </button>
                      <span className="font-heading text-[13px] font-bold text-[#1F2340] px-1 min-w-[20px] text-center">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="flex items-center justify-center text-[#146C43] font-bold select-none cursor-pointer"
                        style={{ width: "32px", height: "32px", borderRadius: "50%", fontSize: "15px", marginRight: "2px" }}
                        aria-label="Tambah jumlah"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="cursor-pointer transition-colors p-1"
                      style={{ color: "#8A8FA8" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#E5484D"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#8A8FA8"; }}
                      aria-label="Hapus item"
                    >
                      <Trash2 style={{ width: "16px", height: "16px" }} strokeWidth={2} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Standard Cart */}
            {items.length > 0 && (
              <div
                className="px-4 pt-3 pb-4 space-y-3 shrink-0"
                style={{ borderTop: "1px solid rgba(226,230,242,0.60)", background: "#EEF0F8" }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-[16px]"
                  style={{ background: "#F8F9FE", boxShadow: NM_OUT }}
                >
                  <span className="font-sans text-[13px] text-[#8A8FA8]">Total Pembelian:</span>
                  <span className="font-heading font-bold text-[18px] text-[#1F2340]">
                    {formatRupiah(selectedTotalAmount)}
                  </span>
                </div>

                <div className="flex gap-2.5">
                  <Link
                    href="/keranjang"
                    onClick={handleClose}
                    className="flex-1 flex items-center justify-center font-heading font-semibold text-[13px] text-[#146C43] transition-all active:scale-[0.97]"
                    style={{
                      height: "48px", borderRadius: "14px",
                      background: "#F8F9FE", boxShadow: NM_OUT,
                    }}
                  >
                    Lihat Detail
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={handleClose}
                    className="flex-[2] flex items-center justify-center gap-1.5 font-heading font-semibold text-[13px] text-white transition-all active:scale-[0.97]"
                    style={{
                      height: "48px", borderRadius: "14px",
                      background: "linear-gradient(135deg, #2E9B63, #146C43)",
                      boxShadow: "0 10px 24px rgba(20,108,67,0.32)",
                    }}
                  >
                    <span>Pesan Sekarang</span>
                    <ArrowRight style={{ width: "16px", height: "16px" }} strokeWidth={2} />
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
