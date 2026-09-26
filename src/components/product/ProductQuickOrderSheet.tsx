"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product, ProductVariant } from "@/types/product";
import { formatRupiah } from "@/lib/formatters";
import { getUnitPrice, getNextTierRecommendation, calculateSavings } from "@/lib/pricing";
import { useCart } from "@/context/CartContext";
import {
  X,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Check,
  TrendingDown,
  Info,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPlaceholderByCategory } from "@/lib/placeholders";

interface ProductQuickOrderSheetProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductQuickOrderSheet: React.FC<ProductQuickOrderSheetProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { addItem } = useCart();
  const [qty, setQty] = useState<number>(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(() => {
    return product.variants && product.variants.length > 0 ? product.variants[0] : undefined;
  });
  const [addedOnlySuccess, setAddedOnlySuccess] = useState<boolean>(false);

  // Reset qty & variant saat modal dibuka untuk produk baru
  useEffect(() => {
    if (isOpen) {
      setQty(1);
      setAddedOnlySuccess(false);
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      } else {
        setSelectedVariant(undefined);
      }
    }
  }, [isOpen, product]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll saat modal aktif
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Single unit: selalu PCS
  const tiers = product.tieredPricesPcs || [];
  const unitPrice = getUnitPrice(tiers, qty);
  const subtotal = qty * unitPrice;
  const basePrice = tiers.length > 0 ? tiers[0].price : unitPrice;
  const savingsPercent = calculateSavings(basePrice, unitPrice);
  const totalSavings = (basePrice - unitPrice) * qty;
  const nextTier = getNextTierRecommendation(tiers, qty);

  const imageSrc =
    selectedVariant?.image ||
    (product.images && product.images.length > 0 && product.images[0] && !product.images[0].includes("photo-1583485088034")
      ? product.images[0]
      : getPlaceholderByCategory(product.categoryCode || product.category));

  const isPlaceholder = imageSrc.startsWith("/placeholders/");

  // Cek apakah ada varian jenis asli (bukan hanya 1 varian standar)
  const hasRealVariants = Boolean(product.variants && product.variants.length > 1);

  const handleIncrement = () => setQty((prev) => prev + 1);
  const handleDecrement = () => setQty((prev) => (prev > 1 ? prev - 1 : 1));
  const handleAddPreset = (amount: number) => setQty((prev) => prev + amount);

  // Aksi Utama: Pesan Sekarang -> langsung simpan ke keranjang & diarahkan ke form pemesanan (/checkout)
  const handleDirectOrder = () => {
    addItem(product, "PCS", qty, selectedVariant);
    onClose();
    router.push("/checkout");
  };

  // Aksi Sekunder: Simpan ke keranjang saja tanpa checkout sekarang (opsional bagi yang ingin lanjut belanja)
  const handleAddToCartOnly = () => {
    addItem(product, "PCS", qty, selectedVariant);
    setAddedOnlySuccess(true);
    setTimeout(() => {
      setAddedOnlySuccess(false);
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      {/* Modal / Bottom Sheet Box */}
      <div
        className="w-full sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle Bar untuk Mobile */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header Modal */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Pesan Cepat (Pcs)
            </span>
            {product.isPromo && (
              <Badge variant="promo" className="text-[10px] uppercase font-bold py-0.2">
                {product.promoTag || "PROMO GROSIR"}
              </Badge>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Bagian Foto & Info Pokok */}
          <div className="flex gap-4 items-start">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center shadow-xs">
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                sizes="120px"
                className={isPlaceholder ? "object-contain p-2 bg-[#F9FBFA]" : "object-cover"}
              />
            </div>

            <div className="flex-1 min-w-0">
              {/* Rating & Info Rapi (mencegah teks ulasan patah baris) */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1 flex-wrap">
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span className="font-bold text-gray-800">{product.rating}</span>
                  <span className="text-gray-400 text-[11px] whitespace-nowrap">
                    ({product.reviewCount} ulasan)
                  </span>
                </div>
                {product.categoryCode && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-[11px] text-gray-500 uppercase font-medium">
                      {product.categoryCode}
                    </span>
                  </>
                )}
              </div>

              <h2 className="font-heading font-black text-base sm:text-lg text-gray-900 leading-snug line-clamp-2">
                {product.name}
              </h2>

              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="font-price font-black text-primary text-xl sm:text-2xl tracking-tight">
                  {formatRupiah(unitPrice)}
                </span>
                <span className="text-xs text-gray-500 font-medium">/pcs</span>

                {unitPrice < basePrice && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Hemat {savingsPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section Keterangan / Deskripsi Produk */}
          <div className="bg-gray-50/80 rounded-2xl p-3.5 border border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1">
              <Info className="w-3.5 h-3.5 text-primary" />
              <span>Keterangan Produk:</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description ||
                "Produk resmi berkualitas terjamin, cocok untuk kebutuhan toko kelontong, usaha fotokopi, alat tulis kantor, maupun pemakaian pribadi."}
            </p>
          </div>

          {/* Pilihan Varian Jenis Produk (Hanya tampil jika benar-benar ada varian jenis) */}
          {hasRealVariants && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                <span>Pilih Varian Jenis / Tipe:</span>
                <span className="text-xs font-normal text-primary">
                  Terpilih: <strong>{selectedVariant?.name}</strong>
                </span>
              </label>

              <div className="flex flex-wrap gap-2">
                {product.variants!.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-xs ring-2 ring-emerald-200"
                          : "bg-white text-gray-700 border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                      }`}
                    >
                      {variant.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Daftar Tingkat Harga Grosir (per pcs) */}
          {tiers.length > 1 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-800">Tingkat Harga Grosir (Satuan Pcs):</span>
                <span className="text-[11px] text-gray-500">Makin banyak makin murah</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {tiers.map((tier, idx) => {
                  const isActive =
                    qty >= tier.minQty && (tier.maxQty === null || qty <= tier.maxQty);
                  return (
                    <div
                      key={idx}
                      onClick={() => setQty(tier.minQty)}
                      className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                        isActive
                          ? "bg-emerald-50/80 border-primary ring-1 ring-primary shadow-xs"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-[11px] font-bold text-gray-600">
                        {tier.maxQty ? `${tier.minQty} - ${tier.maxQty} pcs` : `≥ ${tier.minQty} pcs`}
                      </div>
                      <div
                        className={`text-xs font-black font-price mt-0.5 ${
                          isActive ? "text-primary" : "text-gray-900"
                        }`}
                      >
                        {formatRupiah(tier.price)}
                      </div>
                      {isActive && (
                        <div className="text-[9px] font-bold text-primary mt-0.5 uppercase tracking-wide">
                          ✓ Sedang Aktif
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {nextTier && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                  <TrendingDown className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    Beli <strong>{nextTier.moreNeeded} pcs lagi</strong> untuk dapat harga{" "}
                    <strong>{formatRupiah(nextTier.nextPrice)}/pcs</strong> (Hemat {nextTier.potentialSavings}%)!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Stepper Jumlah / Kuantitas */}
          <div className="space-y-2 pt-1 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800">Jumlah Pembelian (Pcs):</label>
              <div className="text-xs text-gray-500">
                Subtotal:{" "}
                <strong className="text-sm font-price font-black text-gray-900">
                  {formatRupiah(subtotal)}
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shadow-xs">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={qty <= 1}
                  className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Kurangi 1 pcs"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setQty(isNaN(val) || val <= 0 ? 1 : val);
                  }}
                  className="w-16 h-10 text-center font-bold text-sm text-gray-900 border-x border-gray-200 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Tambah 1 pcs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Preset Buttons (+5, +10, +25, +50) */}
              <div className="flex items-center gap-1.5 flex-1 overflow-x-auto no-scrollbar">
                {[5, 10, 25, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-emerald-100 hover:text-primary text-gray-700 border border-gray-200 transition-all shrink-0 active:scale-95"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            {totalSavings > 0 && (
              <p className="text-[11px] text-emerald-700 font-medium">
                🎉 Anda hemat {formatRupiah(totalSavings)} dibanding harga eceran!
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions: Pesan Sekarang Langsung ke Form Pemesanan */}
        <div className="p-3.5 sm:p-4 border-t border-gray-100 bg-gray-50/80 space-y-2 shrink-0">
          <div className="grid grid-cols-12 gap-2 w-full">
            {/* Tombol Simpan ke Keranjang Saja (Sekunder - 35%) */}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddToCartOnly}
              className="col-span-4 h-11 sm:h-12 px-1.5 sm:px-2 rounded-xl sm:rounded-2xl border-gray-200 bg-white hover:bg-gray-100 text-gray-700 hover:text-primary hover:border-primary text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1 min-w-0"
              title="Simpan ke keranjang untuk belanja produk lain"
            >
              {addedOnlySuccess ? (
                <span className="flex items-center gap-1 text-emerald-600 text-[11px] truncate">
                  <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />
                  <span className="truncate">Tersimpan</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] sm:text-xs truncate">
                  <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">+ Keranjang</span>
                </span>
              )}
            </Button>

            {/* Tombol Utama: Pesan Sekarang -> Langsung ke Form Pemesanan (/checkout - 65%) */}
            <Button
              type="button"
              onClick={handleDirectOrder}
              className="col-span-8 min-h-[44px] h-11 sm:h-12 px-2 sm:px-3 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary-dark text-white font-heading font-black text-xs sm:text-sm tracking-tight transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5 min-w-0"
            >
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-300 text-amber-300 shrink-0" />
              <span className="truncate">Pesan Sekarang • {formatRupiah(subtotal)}</span>
            </Button>
          </div>

          <p className="text-[10px] text-center text-gray-400">
            Tekan <strong>Pesan Sekarang</strong> untuk langsung mengisi form pengiriman WhatsApp tanpa buka keranjang
          </p>
        </div>
      </div>
    </div>
  );
};
