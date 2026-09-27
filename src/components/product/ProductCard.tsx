"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductVariant } from "@/types/product";
import { formatRupiah } from "@/lib/formatters";
import { getUnitPrice } from "@/lib/pricing";
import { useCart } from "@/context/CartContext";
import {
  Info,
  Plus,
  Minus,
  ShoppingCart,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPlaceholderByCategory } from "@/lib/placeholders";
import { HighlightText } from "@/components/common/HighlightText";

interface ProductCardProps {
  product: Product;
  highlightQuery?: string;
  variant?: "list" | "grid";
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  highlightQuery,
}) => {
  const { addItem } = useCart();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [qty, setQty] = useState(0);
  const [added, setAdded] = useState(false);

  // Varian produk: varian jenis/warna asli
  const variants: ProductVariant[] =
    product.variants && product.variants.length > 0
      ? product.variants
      : [{ id: product.id, name: "Standar" }];

  const hasVariants =
    variants.length > 1 &&
    variants.some(
      (v) =>
        v.name &&
        v.name.toLowerCase() !== "standar" &&
        v.name.toLowerCase() !== "pcs",
    );

  const activeVariant: ProductVariant =
    variants[selectedVariantIndex] || variants[0];

  // Satuan produk tetap (default pak atau pcs sesuai produk)
  const satuan = product.satuanDefault || product.unitPcsName || "pak";

  // Tier harga bertingkat (3 baris terlihat langsung di kartu)
  const tiers = product.tieredPricesPcs || [];
  const displayTiers = tiers.length > 0 ? tiers.slice(0, 3) : [];

  // Hitung harga satuan berdasarkan qty yang sedang dipilih
  const currentUnitPrice = getUnitPrice(tiers, qty > 0 ? qty : 1);
  const currentSubtotal = qty * currentUnitPrice;

  // Gambar varian aktif atau fallback placeholder
  const activeImageSrc =
    activeVariant.image ||
    (product.images &&
    product.images.length > 0 &&
    product.images[0] &&
    !product.images[0].includes("photo-1583485088034")
      ? product.images[0]
      : getPlaceholderByCategory(product.categoryCode || product.category));
  const isPlaceholder = activeImageSrc.startsWith("/placeholders/");

  const handleIncrement = () => {
    setQty((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQty((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 0) {
      setQty(0);
    } else {
      setQty(val);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (qty <= 0) return;

    addItem(product, "PCS", qty, activeVariant);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQty(0); // Reset ke 0 setelah masuk keranjang agar user bisa pesan varian lain atau geser ke produk lain
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 hover:border-primary/40 shadow-xs hover:shadow-md transition-all duration-200 p-3.5 sm:p-4.5 space-y-3.5">
      {/* 1. Baris Atas: Foto Produk (Kiri) + Info & Tabel Harga Bertingkat (Kanan) */}
      <div className="flex gap-3 sm:gap-4 items-start">
        {/* Foto Produk dengan Badge Varian (V1, V2, dst) */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center shadow-xs">
          <Image
            src={activeImageSrc}
            alt={`${product.name} - ${activeVariant.name}`}
            fill
            sizes="120px"
            className={`${
              isPlaceholder ? "object-contain p-2 bg-[#F9FBFA]" : "object-cover"
            } transition-transform duration-300`}
          />
          {/* Badge Varian Aktif (V1, V2) di sudut kiri atas foto sesuai referensi (hanya jika ada multi varian) */}
          {hasVariants && (
            <div className="absolute top-1.5 left-1.5 z-10 bg-black/75 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-xs">
              V{selectedVariantIndex + 1}
            </div>
          )}

          {/* Badge Promo jika ada */}
          {product.isPromo && (
            <div className="absolute bottom-1.5 right-1.5 z-10">
              <Badge
                variant="promo"
                className="text-[8px] px-1 py-0.2 uppercase font-extrabold shadow-xs"
              >
                PROMO
              </Badge>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Nama Produk, Varian Aktif, & Tabel Harga 3 Baris */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div>
            <h3 className="font-heading font-black text-sm sm:text-base text-gray-900 tracking-tight leading-snug uppercase line-clamp-2">
              <Link
                href={`/produk/${product.id}`}
                className="hover:text-primary transition-colors"
              >
                {highlightQuery ? (
                  <HighlightText text={product.name} query={highlightQuery} />
                ) : (
                  product.name
                )}
              </Link>
            </h3>
            {hasVariants && (
              <p className="text-xs text-gray-500 font-medium">
                ({activeVariant.name} (V{selectedVariantIndex + 1}))
              </p>
            )}
          </div>

          {/* Tabel Harga Bertingkat Langsung Terlihat (Sesuai Pola Snowman) */}
          <div className="bg-gray-50/90 rounded-xl p-2 sm:p-2.5 border border-gray-100 text-xs space-y-1">
            {displayTiers.length > 0 ? (
              displayTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-[11px] sm:text-xs"
                >
                  <span className="text-gray-600 font-medium">
                    {tier.maxQty
                      ? `Beli ${tier.minQty}–${tier.maxQty} ${satuan}`
                      : `Beli ≥ ${tier.minQty} ${satuan}`}
                  </span>
                  <span className="font-price font-bold text-gray-900 tracking-tight">
                    @ {formatRupiah(tier.price)}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">
                  Beli 1 {satuan}
                </span>
                <span className="font-price font-bold text-gray-900">
                  @ {formatRupiah(5000)}
                </span>
              </div>
            )}
          </div>

          {/* Kotak Info Biru Muda: Keterangan (Item #1 yang dilingkari user) */}
          {product.keterangan && (
            <div className="bg-sky-50 text-sky-800 border border-sky-200/80 rounded-xl px-2.5 py-1.5 text-[11px] sm:text-xs flex items-center gap-1.5 font-medium">
              <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="truncate">
                <strong>Keterangan:</strong> {product.keterangan}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Bagian Tengah: Pilih Varian Gambar & Swatch (HANYA jika ada varian asli) */}
      {hasVariants && (
        <div className="space-y-1.5 pt-1 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-700 tracking-wider uppercase">
              PILIH VARIAN GAMBAR:
            </span>
            <span className="text-[11px] font-bold text-primary">
              {variants.length} Varian Tersedia
            </span>
          </div>

          {/* Baris Swatch / Thumbnail Varian */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pt-0.5">
            {variants.map((v, idx) => {
              const isSelected = selectedVariantIndex === idx;
              return (
                <button
                  key={v.id || idx}
                  type="button"
                  onClick={() => setSelectedVariantIndex(idx)}
                  className={`w-13 sm:w-14 h-13 sm:h-14 rounded-xl border-2 transition-all p-1 flex flex-col items-center justify-center shrink-0 relative cursor-pointer active:scale-95 ${
                    isSelected
                      ? "border-primary bg-emerald-50/70 shadow-xs ring-2 ring-emerald-200"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  title={v.name}
                >
                  {/* Visual Swatch: Warna Hex / Inisial */}
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-2xs"
                    style={{
                      backgroundColor:
                        v.colorHex || (isSelected ? "#146C43" : "#64748B"),
                    }}
                  >
                    {v.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span
                    className={`text-[9px] font-bold mt-1 leading-none ${
                      isSelected ? "text-primary" : "text-gray-600"
                    }`}
                  >
                    V{idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Baris Bawah: Stepper Jumlah & Tombol Masukkan Keranjang */}
      <div className="space-y-1 pt-1 border-t border-gray-100">
        <div className="text-[11px] font-semibold text-gray-600">
          {hasVariants
            ? `Jumlah Varian (V${selectedVariantIndex + 1}):`
            : `Jumlah (${satuan}):`}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full">
          {/* Stepper (- [0] +) */}
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs shrink-0">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={qty <= 0}
              className="w-9 sm:w-10 h-11 flex items-center justify-center text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Kurangi jumlah"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="w-14 sm:w-16 h-11 border-x border-gray-200 flex flex-col items-center justify-center bg-white px-1">
              <input
                type="number"
                min="0"
                value={qty}
                onChange={handleDirectInput}
                className="w-full text-center font-heading font-black text-sm text-gray-900 focus:outline-hidden leading-none bg-transparent"
                aria-label="Jumlah pesanan"
              />
              <span className="text-[9px] text-gray-400 font-medium leading-none mt-0.5">
                {satuan}
              </span>
            </div>

            <button
              type="button"
              onClick={handleIncrement}
              className="w-9 sm:w-10 h-11 flex items-center justify-center text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Tambah jumlah"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Tombol Masukkan Keranjang */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={qty <= 0}
            className={`flex-1 h-11 px-3 rounded-xl flex flex-col items-center justify-center font-heading transition-all shadow-xs ${
              qty > 0
                ? added
                  ? "bg-emerald-700 text-white shadow-md ring-2 ring-emerald-300"
                  : "bg-primary hover:bg-primary-dark text-white shadow-md active:scale-[0.98] cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200"
            }`}
          >
            {added ? (
              <span className="flex items-center gap-1.5 text-xs sm:text-sm font-black">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Masuk Keranjang!</span>
              </span>
            ) : (
              <>
                <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold tracking-tight">
                  <ShoppingCart className="w-4 h-4" />
                  <span>MASUKKAN KERANJANG</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-normal leading-none mt-0.5 opacity-90">
                  {qty > 0
                    ? `Total: ${formatRupiah(currentSubtotal)}`
                    : hasVariants
                    ? "Pilih jumlah varian dulu"
                    : "Pilih jumlah dulu"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
