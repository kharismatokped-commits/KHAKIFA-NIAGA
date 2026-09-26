"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { formatRupiah } from "@/lib/formatters";
import { useCart } from "@/context/CartContext";
import { Star, ShoppingCart, Check, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPlaceholderByCategory } from "@/lib/placeholders";
import { HighlightText } from "@/components/common/HighlightText";
import { ProductQuickOrderSheet } from "@/components/product/ProductQuickOrderSheet";

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
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const imageSrc =
    product.images &&
    product.images.length > 0 &&
    product.images[0] &&
    !product.images[0].includes("photo-1583485088034")
      ? product.images[0]
      : getPlaceholderByCategory(product.categoryCode || product.category);

  const isPlaceholder = imageSrc.startsWith("/placeholders/");

  // Ambil harga tier grosir terendah (paling murah) dan harga awal (satuan pcs)
  const lowestPcsPrice =
    product.tieredPricesPcs.length > 0
      ? product.tieredPricesPcs[product.tieredPricesPcs.length - 1].price
      : 0;

  const highestPcsPrice =
    product.tieredPricesPcs.length > 0 ? product.tieredPricesPcs[0].price : 0;

  const hasMultipleVariants = Boolean(
    product.variants && product.variants.length > 1,
  );

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Jika produk memiliki varian pilihan asli (misal warna/tipe), buka sheet agar pembeli memilih varian
    if (hasMultipleVariants) {
      setIsSheetOpen(true);
      return;
    }

    // Default: masukkan 1 pcs langsung
    const defaultVariant =
      product.variants && product.variants.length > 0
        ? product.variants[0]
        : undefined;
    addItem(product, "PCS", 1, defaultVariant);

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleOpenSheet = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSheetOpen(true);
  };

  if (variant === "grid") {
    return (
      <>
        <div className="bg-white rounded-2xl border border-gray-200/90 hover:border-primary p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
          {/* Klik kartu langsung membuka Sheet Keterangan + Pesan Cepat */}
          <div
            onClick={handleOpenSheet}
            className="block cursor-pointer focus:outline-hidden"
            role="button"
            tabIndex={0}
            aria-label={`Buka detail dan pesan ${product.name}`}
          >
            {/* Foto Produk: aspect-[4/3] */}
            <div className="relative aspect-[4/3] w-full rounded-xl bg-gray-50 overflow-hidden mb-1.5 border border-gray-100 flex items-center justify-center">
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, 200px"
                className={`${
                  isPlaceholder
                    ? "object-contain p-2 bg-[#F9FBFA]"
                    : "object-cover"
                } group-hover:scale-105 transition-transform duration-300`}
              />
              {/* Badge kondisional promo */}
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

              {/* Indikator Real Varian jika ada jenis pilihan */}
              {hasMultipleVariants && (
                <div className="absolute bottom-1.5 right-1.5 z-10 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  {product.variants!.length} Varian
                </div>
              )}
            </div>

            {/* Baris Rating & Ulasan */}
            <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span className="font-bold text-gray-700">{product.rating}</span>
              <span className="text-gray-400">({product.reviewCount})</span>
            </div>

            {/* Nama Produk line-clamp-2 */}
            <h3 className="font-heading font-medium text-gray-900 text-xs sm:text-[13px] leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[32px]">
              {highlightQuery ? (
                <HighlightText text={product.name} query={highlightQuery} />
              ) : (
                product.name
              )}
            </h3>

            {/* Baris Harga Per Pcs */}
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[10px] text-gray-500 font-medium">Mulai</span>
              <span className="font-price font-bold text-primary text-sm sm:text-base tracking-tight">
                {formatRupiah(lowestPcsPrice)}
              </span>
              <span className="text-[10px] text-gray-500">/pcs</span>
            </div>

            {/* Hint Keterangan */}
            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-800/80 font-medium">
              <FileText className="w-2.5 h-2.5" />
              <span>Lihat Keterangan & Grosir</span>
            </div>
          </div>

          {/* Tombol + Keranjang */}
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
                  <span>
                    {hasMultipleVariants ? "Pilih Varian" : "+ Keranjang"}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Modal Sheet Keterangan + Pesan Cepat */}
        <ProductQuickOrderSheet
          product={product}
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
        />
      </>
    );
  }

  // Tampilan List
  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200/90 hover:border-primary p-3 sm:p-4 shadow-xs hover:shadow-md transition-all duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Kolom Kiri & Tengah: Foto + Informasi Produk (Klik buka sheet keterangan) */}
          <div
            onClick={handleOpenSheet}
            className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0 group cursor-pointer"
            role="button"
            tabIndex={0}
          >
            {/* Foto Produk */}
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

            {/* Nama, Rating & Harga */}
            <div className="flex-1 min-w-0">
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

              <h3 className="font-heading font-medium text-gray-900 text-[13px] sm:text-[14px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {highlightQuery ? (
                  <HighlightText text={product.name} query={highlightQuery} />
                ) : (
                  product.name
                )}
              </h3>

              {/* Harga per pcs */}
              <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
                <span className="text-[12px] text-gray-500 font-normal">
                  Mulai:
                </span>
                <span className="font-price font-bold text-primary text-[16px] tracking-tight">
                  {formatRupiah(lowestPcsPrice)}
                </span>
                <span className="text-[12px] text-gray-500 font-normal">/pcs</span>

                {highestPcsPrice > lowestPcsPrice && (
                  <span className="font-price text-[12px] text-gray-400 line-through ml-1 hidden sm:inline">
                    {formatRupiah(highestPcsPrice)}
                  </span>
                )}
              </div>

              {/* Keterangan singkat & varian */}
              <p className="mt-1 text-[11px] text-gray-500 line-clamp-1">
                {product.description || "Klik untuk lihat keterangan lengkap & tingkat harga grosir."}
              </p>
            </div>
          </div>

          {/* Kolom Kanan: Tombol Aksi Langsung */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0">
            <button
              type="button"
              onClick={handleOpenSheet}
              className="text-[12px] font-medium text-primary hover:underline flex items-center gap-1 sm:mb-1 order-2 sm:order-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lihat Keterangan & Harga</span>
            </button>

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
                  <span>
                    {hasMultipleVariants
                      ? "Pilih Varian & Pesan"
                      : "+ Masukkan ke Keranjang"}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Sheet Keterangan + Pesan Cepat */}
      <ProductQuickOrderSheet
        product={product}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </>
  );
};
