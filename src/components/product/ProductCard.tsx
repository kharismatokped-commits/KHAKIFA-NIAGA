"use client";

import React, { useState } from "react";
import { Product, ProductVariant } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { Info, Check } from "lucide-react";
import { getPlaceholderByCategory } from "@/lib/placeholders";

interface ProductCardProps {
  product: Product;
  highlightQuery?: string;
  variant?: "list" | "grid";
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
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
    /* ── Kartu Produk Soft UI / Neumorphism ── */
    <div
      className="rounded-[22px] overflow-hidden mb-4 transition-all duration-150 active:scale-[0.99]"
      style={{
        background: "#F8F9FE",
        boxShadow: "8px 8px 18px rgba(163,177,198,0.28), -6px -6px 16px rgba(255,255,255,0.90)",
      }}
    >
      {/* Baris atas: gambar + judul + tabel harga */}
      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        <div
          className="w-28 h-28 flex-shrink-0 rounded-[18px] overflow-hidden relative flex items-center justify-center"
          style={{ background: "#E9ECF6" }}
        >
          <img
            src={activeImageSrc}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {/* Overlay gloss putih — efek 3D glossy */}
          <div
            className="absolute inset-0 rounded-[18px] pointer-events-none"
            style={{
              background: "linear-gradient(155deg, rgba(255,255,255,0.45) 50%, transparent 62%)",
            }}
          />
          {hasVariants && (
            <span className="absolute top-1 left-1 bg-[#1F2340]/80 text-white font-sans text-[10px] px-1.5 py-0.5 rounded-md z-10">
              {activeKode}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-[14px] text-[#1F2340] leading-snug mb-0.5">
            {product.name}
          </h3>
          <p className="font-sans text-[11px] text-[#8A8FA8] mt-0.5 mb-2">
            {hasVariants ? `(${activeVariant.name})` : `(${satuan})`}
          </p>

          {/* Tabel harga — inset */}
          <div
            className="rounded-[14px] divide-y divide-[#E2E6F2] overflow-hidden"
            style={{
              background: "#E9ECF6",
              boxShadow: "inset 3px 3px 7px rgba(163,177,198,0.22), inset -3px -3px 7px rgba(255,255,255,0.85)",
            }}
          >
            {priceTiers.length > 0 ? (
              priceTiers.slice(0, 3).map((tier, idx) => (
                <div key={idx} className="flex justify-between items-center px-3 py-1.5">
                  <span className="font-sans text-[12px] text-[#8A8FA8]">
                    Beli {tier.minQty}
                    {tier.maxQty ? `–${tier.maxQty}` : "+"} {satuan}
                  </span>
                  <span className="font-heading font-bold text-[15px] text-[#146C43]">
                    @Rp {tier.price.toLocaleString("id-ID")}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex justify-between items-center px-3 py-1.5">
                <span className="font-sans text-[12px] text-[#8A8FA8]">
                  Beli 1 {satuan}
                </span>
                <span className="font-heading font-bold text-[15px] text-[#146C43]">
                  @Rp {(5000).toLocaleString("id-ID")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kotak keterangan */}
      {product.keterangan && (
        <div
          className="mx-3 mb-3 flex items-center gap-2 text-[#1F2340] font-sans text-[13px] px-3 py-2 rounded-[14px]"
          style={{
            background: "#E9ECF6",
            boxShadow: "inset 3px 3px 7px rgba(163,177,198,0.22), inset -3px -3px 7px rgba(255,255,255,0.85)",
          }}
        >
          <Info className="w-4 h-4 flex-shrink-0 text-[#146C43]" strokeWidth={2} />
          <span>Keterangan: {product.keterangan}</span>
        </div>
      )}

      {/* Pilih varian */}
      {hasVariants && (
        <>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="font-sans text-[12px] font-medium text-[#1F2340]">
              Pilih Varian:
            </span>
            <span className="font-sans text-[12px] text-[#146C43] font-medium">
              {variants.length} Varian Tersedia
            </span>
          </div>
          <div className="px-3 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
            {variants.map((v, idx) => (
              <button
                key={v.id || idx}
                type="button"
                onClick={() => setSelectedVariantIndex(idx)}
                className={`flex-shrink-0 w-14 flex flex-col items-center gap-1 rounded-[14px] border-2 p-1 transition-all ${
                  idx === selectedVariantIndex
                    ? "border-[#146C43]"
                    : "border-transparent"
                }`}
                style={
                  idx === selectedVariantIndex
                    ? { background: "#F8F9FE", boxShadow: "0 4px 12px rgba(20,108,67,0.18)" }
                    : { background: "#E9ECF6", boxShadow: "inset 2px 2px 5px rgba(163,177,198,0.22), inset -2px -2px 5px rgba(255,255,255,0.85)" }
                }
              >
                {v.image ? (
                  <img
                    src={v.image}
                    className="w-12 h-12 rounded-lg object-cover"
                    alt={v.name}
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center font-heading text-xs font-bold text-white shadow-sm"
                    style={{
                      backgroundColor:
                        v.colorHex ||
                        (idx === selectedVariantIndex ? "#146C43" : "#64748B"),
                    }}
                  >
                    {v.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="font-sans text-[11px] text-[#8A8FA8] font-medium">
                  V{idx + 1}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Stepper + Tombol Keranjang + Tombol Checkout */}
      <div className="flex items-center gap-2 px-3 pb-3">
        {/* Stepper — inset shadow */}
        <div
          className="flex items-center h-[44px] rounded-[13px] overflow-hidden shrink-0"
          style={{
            background: "#E9ECF6",
            boxShadow: "inset 4px 4px 9px rgba(163,177,198,0.28), inset -4px -4px 9px rgba(255,255,255,0.92)",
          }}
        >
          <button
            type="button"
            onClick={() => setQty(Math.max(0, qty - 1))}
            className="w-9 h-full flex items-center justify-center text-[#146C43] hover:bg-white/30 transition-colors select-none font-bold cursor-pointer text-sm"
            aria-label="Kurangi jumlah"
          >
            −
          </button>
          <div className="w-9 text-center">
            <div className="font-heading font-bold text-[14px] text-[#1F2340] leading-tight">{qty}</div>
            <div className="font-sans text-[10px] text-[#8A8FA8] leading-tight">{satuan}</div>
          </div>
          <button
            type="button"
            onClick={() => setQty(qty + 1)}
            className="w-9 h-full flex items-center justify-center text-[#146C43] hover:bg-white/30 transition-colors select-none font-bold cursor-pointer text-sm"
            aria-label="Tambah jumlah"
          >
            +
          </button>
        </div>

        {/* Tombol + Keranjang — outline w-[44px] */}
        <button
          type="button"
          disabled={qty === 0}
          onClick={handleAddToCart}
          className="w-[44px] h-[44px] flex-shrink-0 rounded-[13px] flex items-center justify-center transition-all"
          style={
            qty === 0
              ? {
                  background: "#E9ECF6",
                  boxShadow: "inset 4px 4px 9px rgba(163,177,198,0.28), inset -4px -4px 9px rgba(255,255,255,0.92)",
                  color: "#9CA3AF",
                  cursor: "not-allowed",
                }
              : added
              ? {
                  background: "#F8F9FE",
                  border: "2px solid #146C43",
                  boxShadow: "0 4px 12px rgba(20,108,67,0.22)",
                  color: "#146C43",
                }
              : {
                  background: "#F8F9FE",
                  border: "2px solid #146C43",
                  boxShadow: "6px 6px 14px rgba(163,177,198,0.30), -6px -6px 14px rgba(255,255,255,0.92)",
                  color: "#146C43",
                  cursor: "pointer",
                }
          }
          title={qty === 0 ? "Pilih jumlah dulu" : "Tambah ke Keranjang"}
          aria-label="Tambah ke Keranjang"
        >
          {added ? (
            <Check className="w-5 h-5 text-[#146C43]" strokeWidth={2} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          )}
        </button>

        {/* Tombol Checkout — solid hijau dengan glow */}
        <button
          type="button"
          disabled={qty === 0}
          onClick={handleQuickCheckout}
          className="flex-1 h-[44px] rounded-[13px] font-heading font-medium text-[14px] flex items-center justify-center transition-all"
          style={
            qty === 0
              ? {
                  background: "#E9ECF6",
                  boxShadow: "inset 4px 4px 9px rgba(163,177,198,0.28), inset -4px -4px 9px rgba(255,255,255,0.92)",
                  color: "#9CA3AF",
                  cursor: "not-allowed",
                }
              : {
                  background: "linear-gradient(135deg, #2E9B63, #146C43)",
                  boxShadow: "0 12px 26px rgba(20,108,67,0.34)",
                  color: "#fff",
                  cursor: "pointer",
                }
          }
        >
          <span>{qty === 0 ? "Pilih jumlah dulu" : "Checkout"}</span>
        </button>
      </div>
    </div>
  );
};
