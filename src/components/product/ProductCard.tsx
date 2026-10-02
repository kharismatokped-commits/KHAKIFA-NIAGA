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

// ── Helper: deteksi apakah nama varian adalah nama warna ─────
const COLOR_NAMES: Record<string, string> = {
  hitam: "#1A1A1A", putih: "#F5F5F5", merah: "#E5484D", biru: "#3B82F6",
  hijau: "#22C55E", kuning: "#EAB308", ungu: "#A855F7", pink: "#EC4899",
  oranye: "#F97316", coklat: "#92400E", abu: "#6B7280", "abu-abu": "#6B7280",
  silver: "#9CA3AF", gold: "#F5B301", emas: "#F5B301", navy: "#1E3A5F",
  tosca: "#14B8A6", krem: "#F5E6C8", maroon: "#7F1D1D", violet: "#7C3AED",
};

function getColorHex(name: string): string | null {
  const lower = name.toLowerCase().trim();
  return COLOR_NAMES[lower] || null;
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

  const activeVariant: ProductVariant = variants[selectedVariantIndex] || variants[0];
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
      className="rounded-[22px] overflow-hidden mb-4 transition-all duration-150"
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
          className="mx-3 mb-3 flex items-center gap-2 text-[#1F2340] font-sans text-[12px] px-3 py-2 rounded-[14px]"
          style={{
            background: "#E9ECF6",
            boxShadow: "inset 3px 3px 7px rgba(163,177,198,0.22), inset -3px -3px 7px rgba(255,255,255,0.85)",
          }}
        >
          <Info className="w-4 h-4 flex-shrink-0 text-[#146C43]" strokeWidth={2} />
          <span>Keterangan: {product.keterangan}</span>
        </div>
      )}

      {/* ── BAGIAN 1: Varian Picker ── */}
      {hasVariants && (
        <>
          {/* Header: "Pilih Varian" + "N Varian Tersedia" */}
          <div className="px-3 mb-2.5 flex items-center justify-between">
            <span className="font-sans text-[12px] font-semibold text-[#1F2340]">
              Pilih Varian
            </span>
            <span
              className="font-sans text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "#E9ECF6",
                color: "#8A8FA8",
                boxShadow: "inset 2px 2px 5px rgba(163,177,198,0.20), inset -2px -2px 5px rgba(255,255,255,0.80)",
              }}
            >
              {variants.length} Varian
            </span>
          </div>

          {/* Grid chip varian — flex-wrap, TIDAK scroll horizontal */}
          <div className="px-3 pb-3 flex flex-wrap gap-2">
            {variants.map((v, idx) => {
              const isActive = idx === selectedVariantIndex;
              const colorHex = v.colorHex || getColorHex(v.name);
              const hasImage = !!v.image;

              return (
                <button
                  key={v.id || idx}
                  type="button"
                  onClick={() => setSelectedVariantIndex(idx)}
                  /* Area sentuh minimal 44px tinggi */
                  style={{
                    minHeight: "44px",
                    padding: "10px 14px",
                    borderRadius: "14px",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    fontFamily: "inherit",
                    fontSize: "13px",
                    fontWeight: isActive ? 700 : 600,
                    transition: "all 0.15s ease",
                    /* Terpilih: inset (tertekan) dengan tint hijau lembut */
                    ...(isActive
                      ? {
                          background: "linear-gradient(135deg, rgba(46,155,99,0.10), rgba(20,108,67,0.06))",
                          boxShadow: "inset 3px 3px 8px rgba(163,177,198,0.28), inset -3px -3px 8px rgba(255,255,255,0.90)",
                          color: "#146C43",
                        }
                      : {
                          /* Normal: raised neumorphic off-white */
                          background: "#F8F9FE",
                          boxShadow: "5px 5px 12px rgba(163,177,198,0.28), -4px -4px 10px rgba(255,255,255,0.90)",
                          color: "#1F2340",
                        }),
                  }}
                  aria-pressed={isActive}
                  aria-label={v.name}
                >
                  {/* Gambar mini jika ada */}
                  {hasImage ? (
                    <img
                      src={v.image!}
                      className="w-5 h-5 rounded-md object-cover flex-shrink-0"
                      alt={v.name}
                    />
                  ) : colorHex ? (
                    /* Lingkaran warna kecil 14px */
                    <span
                      className="flex-shrink-0 rounded-full"
                      style={{
                        width: "14px",
                        height: "14px",
                        background: colorHex,
                        border: "1.5px solid rgba(0,0,0,0.12)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.14)",
                      }}
                    />
                  ) : null}

                  {/* Nama varian LENGKAP */}
                  <span className="leading-none">{v.name}</span>

                  {/* Centang kecil jika terpilih */}
                  {isActive && (
                    <Check
                      className="flex-shrink-0"
                      style={{ width: "13px", height: "13px", color: "#146C43" }}
                      strokeWidth={2.5}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ── Stepper + Tombol Keranjang + Tombol Checkout ── */}
      <div className="flex items-center gap-2 px-3 pb-3">
        {/* Stepper kapsul timbul — neumorphic raised */}
        <div
          className="flex items-center shrink-0"
          style={{
            height: "48px",
            borderRadius: "24px",
            background: "#F8F9FE",
            boxShadow: "6px 6px 14px rgba(163,177,198,0.28), -5px -5px 12px rgba(255,255,255,0.90)",
          }}
        >
          {/* Tombol − bulat */}
          <button
            type="button"
            onClick={() => setQty(Math.max(0, qty - 1))}
            className="flex items-center justify-center text-[#146C43] font-bold select-none cursor-pointer transition-colors hover:bg-white/40"
            style={{ width: "40px", height: "40px", borderRadius: "50%", fontSize: "18px", margin: "4px 0 4px 4px" }}
            aria-label="Kurangi jumlah"
          >
            −
          </button>
          {/* Angka qty + satuan */}
          <div className="flex flex-col items-center justify-center" style={{ width: "38px" }}>
            <span className="font-heading font-bold text-[15px] text-[#1F2340] leading-none">{qty}</span>
            <span className="font-sans text-[9px] text-[#8A8FA8] leading-tight mt-0.5">{satuan}</span>
          </div>
          {/* Tombol + bulat */}
          <button
            type="button"
            onClick={() => setQty(qty + 1)}
            className="flex items-center justify-center text-[#146C43] font-bold select-none cursor-pointer transition-colors hover:bg-white/40"
            style={{ width: "40px", height: "40px", borderRadius: "50%", fontSize: "18px", margin: "4px 4px 4px 0" }}
            aria-label="Tambah jumlah"
          >
            +
          </button>
        </div>

        {/* Tombol Keranjang — kotak timbul w-[48px] outline hijau */}
        <button
          type="button"
          disabled={qty === 0}
          onClick={handleAddToCart}
          className="flex-shrink-0 flex items-center justify-center transition-all duration-150"
          style={{
            width: "48px", height: "48px", borderRadius: "16px",
            ...(qty === 0
              ? {
                  background: "#E9ECF6",
                  boxShadow: "inset 4px 4px 9px rgba(163,177,198,0.28), inset -4px -4px 9px rgba(255,255,255,0.92)",
                  color: "#B0B4C0",
                  cursor: "not-allowed",
                }
              : added
              ? {
                  background: "#F0FDF4",
                  border: "2px solid #146C43",
                  boxShadow: "0 4px 12px rgba(20,108,67,0.22)",
                  color: "#146C43",
                }
              : {
                  background: "#F8F9FE",
                  border: "2px solid #146C43",
                  boxShadow: "6px 6px 14px rgba(163,177,198,0.28), -5px -5px 12px rgba(255,255,255,0.90)",
                  color: "#146C43",
                  cursor: "pointer",
                }),
          }}
          title={qty === 0 ? "Pilih jumlah dulu" : "Tambah ke Keranjang"}
          aria-label="Tambah ke Keranjang"
        >
          {added ? (
            <Check className="w-5 h-5 text-[#146C43]" strokeWidth={2.5} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          )}
        </button>

        {/* Tombol Checkout — solid hijau gradien dengan glow */}
        <button
          type="button"
          disabled={qty === 0}
          onClick={handleQuickCheckout}
          className="flex-1 flex items-center justify-center font-heading font-bold text-[13px] transition-all duration-150 active:scale-[0.97]"
          style={{
            height: "48px", borderRadius: "16px",
            ...(qty === 0
              ? {
                  background: "#E9ECF6",
                  boxShadow: "inset 4px 4px 9px rgba(163,177,198,0.28), inset -4px -4px 9px rgba(255,255,255,0.92)",
                  color: "#B0B4C0",
                  cursor: "not-allowed",
                }
              : {
                  background: "linear-gradient(135deg, #2E9B63, #146C43)",
                  boxShadow: "0 10px 22px rgba(20,108,67,0.32)",
                  color: "#fff",
                  cursor: "pointer",
                }),
          }}
        >
          <span>{qty === 0 ? "Pilih jumlah dulu" : "Checkout"}</span>
        </button>
      </div>
    </div>
  );
};
