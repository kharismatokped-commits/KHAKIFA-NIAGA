"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import { formatRupiah } from "@/lib/formatters";
import { useCart } from "@/context/CartContext";
import { Star, Package, ShoppingCart, Check, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  variant = "list",
}) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const imageSrc =
    product.images &&
    product.images.length > 0 &&
    product.images[0] &&
    !product.images[0].includes("photo-1583485088034")
      ? product.images[0]
      : getPlaceholderByCategory(product.categoryCode || product.category);

  const isPlaceholder = imageSrc.startsWith("/placeholders/");

  // Ambil harga tier grosir terendah (paling murah) dan harga eceran awal
  const lowestPcsPrice =
    product.tieredPricesPcs.length > 0
      ? product.tieredPricesPcs[product.tieredPricesPcs.length - 1].price
      : 0;

  const highestPcsPrice =
    product.tieredPricesPcs.length > 0 ? product.tieredPricesPcs[0].price : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Default: masukkan satuan PCS atau PAK dengan varian pertama
    const defaultVariant =
      product.variants && product.variants.length > 0
        ? product.variants[0]
        : undefined;
    addItem(product, "PCS", 1, defaultVariant);

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (variant === "grid") {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/90 hover:border-primary p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
        <Link href={`/produk/${product.id}`} className="block">
          {/* Foto Produk: aspect-[4/3] (dikurangi ~20% dari square agar proporsional & muat lebih banyak di layar HP) */}
          <div className="relative aspect-[4/3] w-full rounded-xl bg-gray-50 overflow-hidden mb-1.5 border border-gray-100 flex items-center justify-center">
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, 200px"
              className={`${
                isPlaceholder ? "object-contain p-2 bg-[#F9FBFA]" : "object-cover"
              } group-hover:scale-105 transition-transform duration-300`}
            />
            {/* Badge kondisional: HANYA tampil jika isPromo === true */}
            {product.isPromo && (
              <div className="absolute top-1.5 left-1.5 z-10">
                <Badge
                  variant="promo"
                  className="text-[9px] px-1.5 py-0.2 font-extrabold uppercase shadow-xs tracking-tight"
                >
                  {product.promoTag || "GROSIR TERMURAH"}
                </Badge>
              </div>
            )}
          </div>

          {/* Baris Rating & Ulasan Rapat */}
          <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            <span className="font-bold text-gray-700">{product.rating}</span>
            <span className="text-gray-400">({product.reviewCount})</span>
          </div>

          {/* Nama Produk 13px line-clamp-2 */}
          <h3 className="font-heading font-medium text-gray-900 text-xs sm:text-[13px] leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[32px]">
            {highlightQuery ? (
              <HighlightText text={product.name} query={highlightQuery} />
            ) : (
              product.name
            )}
          </h3>

          {/* Baris Harga Rapat (Ukuran font tetap sama persis: text-sm sm:text-base font-bold) */}
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-[10px] text-gray-500 font-medium">Mulai</span>
            <span className="font-price font-bold text-primary text-sm sm:text-base tracking-tight">
              {formatRupiah(lowestPcsPrice)}
            </span>
            <span className="text-[10px] text-gray-500">
              /{product.unitPcsName}
            </span>
          </div>
        </Link>

        {/* Tombol + Keranjang tetap full-width dan tinggi sama untuk kemudahan tap */}
        <div className="mt-2.5 pt-2 border-t border-gray-100/80">
          <Button
            type="button"
            onClick={handleQuickAdd}
            className={`w-full min-h-[38px] h-9 px-3 rounded-xl font-heading font-medium text-xs tracking-normal transition-all shadow-xs ${
              added
                ? "bg-primary-dark text-white ring-2 ring-emerald-300"
                : "bg-primary hover:bg-primary-dark text-white"
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Masuk!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>+ Keranjang</span>
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 hover:border-primary p-3 sm:p-4 shadow-xs hover:shadow-md transition-all duration-200">
      {/* 1 Kolom List Vertikal: Foto, Nama, Harga Sejajar Horizontal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Kolom Kiri & Tengah: Foto + Informasi Produk */}
        <Link
          href={`/produk/${product.id}`}
          className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0 group"
        >
          {/* Foto Produk Besar (±100px) */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100px, 120px"
              className={`${
                isPlaceholder
                  ? "object-contain p-2 bg-[#F9FBFA]"
                  : "object-cover"
              } group-hover:scale-105 transition-transform duration-300`}
            />
            {product.isPromo && (
              <div className="absolute top-1.5 left-1.5 z-10">
                <Badge
                  variant="promo"
                  className="text-[9px] px-1.5 py-0.2 font-extrabold uppercase shadow-xs"
                >
                  {product.promoTag || "GROSIR TERMURAH"}
                </Badge>
              </div>
            )}
          </div>

          {/* Nama, Rating & Harga Sejajar */}
          <div className="flex-1 min-w-0">
            {/* Rating & Kode */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{product.rating}</span>
                <span className="text-gray-400 font-normal">
                  ({product.reviewCount})
                </span>
              </div>
              <span className="font-mono text-[11px] text-gray-400 hidden sm:inline">
                SKU: {product.sku}
              </span>
            </div>

            {/* Nama Produk 13–14px medium */}
            <h3 className="font-heading font-medium text-gray-900 text-[13px] sm:text-[14px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {highlightQuery ? (
                <HighlightText text={product.name} query={highlightQuery} />
              ) : (
                product.name
              )}
            </h3>

            {/* Harga Produk 16px bold (elemen paling menonjol) */}
            <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
              <span className="text-[12px] text-gray-500 font-normal">
                Mulai:
              </span>
              <span className="font-price font-bold text-primary text-[16px] tracking-tight">
                {formatRupiah(lowestPcsPrice)}
              </span>
              <span className="text-[12px] text-gray-500 font-normal">
                /{product.unitPcsName}
              </span>

              {highestPcsPrice > lowestPcsPrice && (
                <span className="font-price text-[12px] text-gray-400 line-through ml-1 hidden sm:inline">
                  {formatRupiah(highestPcsPrice)}
                </span>
              )}
            </div>

            {/* Kemasan Grosir PAK */}
            {product.hasPack && (
              <div className="mt-1 flex items-center gap-1 text-[12px] text-emerald-800 font-medium">
                <Package className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                <span>
                  Tersedia Grosir {product.unitPackName} (Isi{" "}
                  {product.packRatio} pcs)
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Kolom Kanan: Tombol Beli Langsung (Tinggi minimal 44px, Label 13–14px medium) */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0">
          <Link
            href={`/produk/${product.id}`}
            className="text-[12px] font-medium text-primary hover:underline flex items-center gap-0.5 sm:mb-1 order-2 sm:order-1"
          >
            <span>Cek Harga Grosir</span>
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.2} />
          </Link>

          <Button
            type="button"
            onClick={handleQuickAdd}
            className={`min-h-[44px] h-11 px-5 rounded-xl font-heading font-medium text-[13px] sm:text-[14px] tracking-normal transition-all shadow-sm order-1 sm:order-2 w-full sm:w-auto ${
              added
                ? "bg-primary-dark text-white ring-2 ring-emerald-300"
                : "bg-primary hover:bg-primary-dark text-white"
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Masuk Keranjang!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" strokeWidth={2.2} />
                <span>+ Masukkan ke Keranjang</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
