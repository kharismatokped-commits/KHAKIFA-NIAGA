"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, ProductVariant } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Info, Check } from "lucide-react";
import { getPlaceholderByCategory } from "@/lib/placeholders";

interface ProductCardProps {
  product: Product;
  highlightQuery?: string;
  variant?: "list" | "grid";
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const { addItem, openQuickCheckout } = useCart();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [qty, setQty] = useState(0);
  const [added, setAdded] = useState(false);

  // Varian produk asli
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
  const activeKode = `V${selectedVariantIndex + 1}`;

  // Satuan produk
  const satuan = product.satuanDefault || product.unitPcsName || "pak";

  // Tier harga bertingkat
  const priceTiers = product.tieredPricesPcs || [];

  // Gambar aktif
  const activeImageSrc =
    activeVariant.image ||
    (product.images &&
    product.images.length > 0 &&
    product.images[0] &&
    !product.images[0].includes("photo-1583485088034")
      ? product.images[0]
      : getPlaceholderByCategory(product.categoryCode || product.category));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (qty <= 0) return;

    addItem(product, "PCS", qty, activeVariant);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQty(0);
    }, 1500);
  };

  const handleQuickCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (qty <= 0) return;
    openQuickCheckout(product, activeVariant, qty);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
      {/* Baris atas: gambar + judul + tabel harga */}
      <div className="flex gap-3 p-3">
        <div className="w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden relative bg-gray-50 border border-gray-100 flex items-center justify-center">
          <img
            src={activeImageSrc}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {hasVariants && (
            <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
              {activeKode}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 uppercase leading-tight">
            <Link
              href={`/produk/${product.id}`}
              className="hover:text-[#146C43] transition-colors"
            >
              {product.name}
            </Link>
          </h3>
          <p className="text-xs text-gray-500 mb-2">
            {hasVariants ? `(${activeVariant.name})` : `(${satuan})`}
          </p>

          <div className="rounded-lg bg-gray-50 divide-y divide-gray-200 text-sm">
            {priceTiers.length > 0 ? (
              priceTiers.slice(0, 3).map((tier, idx) => (
                <div key={idx} className="flex justify-between px-3 py-1.5">
                  <span className="text-gray-600 text-xs sm:text-sm">
                    Beli {tier.minQty}
                    {tier.maxQty ? `–${tier.maxQty}` : "+"} {satuan}
                  </span>
                  <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                    @Rp {tier.price.toLocaleString("id-ID")}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex justify-between px-3 py-1.5">
                <span className="text-gray-600 text-xs sm:text-sm">
                  Beli 1 {satuan}
                </span>
                <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                  @Rp {(5000).toLocaleString("id-ID")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kotak keterangan */}
      {product.keterangan && (
        <div className="mx-3 mb-3 flex items-center gap-2 bg-[#EAF3DE] text-[#27500A] text-xs px-3 py-2 rounded-lg">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>Keterangan: {product.keterangan}</span>
        </div>
      )}

      {/* Pilih varian */}
      {hasVariants && (
        <>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">
              Pilih Varian:
            </span>
            <span className="text-xs text-[#146C43] font-medium">
              {variants.length} Varian Tersedia
            </span>
          </div>
          <div className="px-3 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
            {variants.map((v, idx) => (
              <button
                key={v.id || idx}
                type="button"
                onClick={() => setSelectedVariantIndex(idx)}
                className={`flex-shrink-0 w-14 flex flex-col items-center gap-1 rounded-lg border-2 p-1 transition-all ${
                  idx === selectedVariantIndex
                    ? "border-[#146C43] bg-emerald-50/40"
                    : "border-transparent bg-gray-50/50 hover:bg-gray-100/60"
                }`}
              >
                {v.image ? (
                  <img
                    src={v.image}
                    className="w-12 h-12 rounded-md object-cover"
                    alt={v.name}
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-md flex items-center justify-center text-xs font-bold text-white shadow-2xs"
                    style={{
                      backgroundColor:
                        v.colorHex ||
                        (idx === selectedVariantIndex ? "#146C43" : "#64748B"),
                    }}
                  >
                    {v.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="text-[10px] text-gray-600 font-medium">
                  V{idx + 1}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Stepper + Tombol + Keranjang (Kecil) + Tombol Checkout (Besar) */}
      <div className="flex items-center gap-2 px-3 pb-3">
        {/* Stepper */}
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shrink-0">
          <button
            type="button"
            onClick={() => setQty(Math.max(0, qty - 1))}
            className="w-8 h-10 sm:w-9 sm:h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors select-none font-bold cursor-pointer"
            aria-label="Kurangi jumlah"
          >
            −
          </button>
          <div className="w-9 sm:w-10 text-center text-sm">
            <div className="font-semibold text-gray-900 leading-tight">{qty}</div>
            <div className="text-[10px] text-gray-400 leading-tight">{satuan}</div>
          </div>
          <button
            type="button"
            onClick={() => setQty(qty + 1)}
            className="w-8 h-10 sm:w-9 sm:h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors select-none font-bold cursor-pointer"
            aria-label="Tambah jumlah"
          >
            +
          </button>
        </div>

        {/* Tombol + Keranjang (Kecil, outline w-10 h-10 sm:w-11 sm:h-11) */}
        <button
          type="button"
          disabled={qty === 0}
          onClick={handleAddToCart}
          className={`w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 rounded-xl flex items-center justify-center transition-all ${
            qty === 0
              ? "border border-gray-200 text-gray-300 bg-white cursor-not-allowed"
              : added
              ? "border-2 border-emerald-600 bg-emerald-50 text-emerald-600"
              : "border-2 border-[#146C43] bg-white text-[#146C43] hover:bg-emerald-50 active:scale-95 cursor-pointer shadow-xs"
          }`}
          title={qty === 0 ? "Pilih jumlah dulu" : "Tambah ke Keranjang"}
          aria-label="Tambah ke Keranjang"
        >
          {added ? (
            <Check className="w-5 h-5 stroke-[2.5]" />
          ) : (
            <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
          )}
        </button>

        {/* Tombol Checkout (Besar, flex-1, solid hijau #146C43) */}
        <button
          type="button"
          disabled={qty === 0}
          onClick={handleQuickCheckout}
          className={`flex-1 h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center transition-all ${
            qty === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#146C43] hover:bg-[#0f5333] text-white active:scale-[0.99] cursor-pointer shadow-sm"
          }`}
        >
          <span>{qty === 0 ? "Pilih jumlah dulu" : "Checkout"}</span>
        </button>
      </div>
    </div>
  );
};
