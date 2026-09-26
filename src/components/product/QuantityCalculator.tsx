"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Product, ProductVariant, UnitType } from "@/types/product";
import { formatRupiah } from "@/lib/formatters";
import { getUnitPrice, getNextTierRecommendation } from "@/lib/pricing";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Minus,
  ShoppingCart,
  Check,
  TrendingDown,
  Zap,
} from "lucide-react";

interface QuantityCalculatorProps {
  product: Product;
  selectedVariant?: ProductVariant;
  unitType?: UnitType;
  onUnitTypeChange?: (unit: UnitType) => void;
  qty: number;
  onQtyChange: (newQty: number) => void;
}

export const QuantityCalculator: React.FC<QuantityCalculatorProps> = ({
  product,
  selectedVariant,
  qty,
  onQtyChange,
}) => {
  const router = useRouter();
  const { addItem } = useCart();
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Tunggal: selalu satuan pcs
  const tiers = product.tieredPricesPcs || [];
  const unitPrice = getUnitPrice(tiers, qty);
  const subtotal = qty * unitPrice;
  const nextTier = getNextTierRecommendation(tiers, qty);

  const handleIncrement = () => {
    onQtyChange(qty + 1);
  };

  const handleDecrement = () => {
    if (qty > 1) {
      onQtyChange(qty - 1);
    }
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val <= 0) {
      onQtyChange(1);
    } else {
      onQtyChange(val);
    }
  };

  const handleAddToCart = () => {
    addItem(product, "PCS", qty, selectedVariant);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 1800);
  };

  const handleDirectOrder = () => {
    addItem(product, "PCS", qty, selectedVariant);
    router.push("/checkout");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-4">
      {/* Stepper Jumlah Pembelian */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] sm:text-[13px] font-medium text-gray-700">
            Atur Jumlah Pembelian (Pcs):
          </label>
          <span className="text-[13px] font-bold text-primary">
            Harga Satuan: {formatRupiah(unitPrice)}/pcs
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={qty <= 1}
              className="w-12 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Kurangi Jumlah"
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              type="number"
              min="1"
              value={qty}
              onChange={handleDirectInput}
              className="w-16 h-12 text-center font-heading font-bold text-base text-gray-900 border-x border-gray-200 focus:outline-hidden"
              aria-label="Jumlah Pembelian Pcs"
            />

            <button
              type="button"
              onClick={handleIncrement}
              className="w-12 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Tambah Jumlah"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-1 overflow-x-auto no-scrollbar">
            {[5, 10, 25, 50, 100].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onQtyChange(qty + preset)}
                className="px-2.5 py-2.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-emerald-100 hover:text-primary text-gray-700 border border-gray-200 transition-all shrink-0 active:scale-95"
              >
                +{preset}
              </button>
            ))}
          </div>
        </div>

        {/* Rekomendasi Hemat Grosir */}
        {nextTier && (
          <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2 text-emerald-800 text-[11px] sm:text-xs">
            <TrendingDown className="w-4 h-4 text-primary shrink-0" />
            <span>
              Beli <strong>{nextTier.moreNeeded} pcs</strong> lagi untuk dapat
              harga grosir{" "}
              <strong>{formatRupiah(nextTier.nextPrice)}/pcs</strong> (Hemat{" "}
              {nextTier.potentialSavings}%)!
            </span>
          </div>
        )}
      </div>

      {/* Rincian Harga & Tombol Aksi */}
      <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] sm:text-xs text-gray-500">
            Total Estimasi ({qty} pcs):
          </div>
          <div className="font-heading font-black text-lg sm:text-xl text-primary font-price tracking-tight">
            {formatRupiah(subtotal)}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Tombol Simpan ke Keranjang Saja */}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddToCart}
            className={`flex-1 sm:flex-none h-11 sm:h-12 px-3 sm:px-4 rounded-xl border-gray-200 text-gray-700 hover:text-primary text-xs sm:text-sm font-bold transition-all shadow-2xs ${
              addedSuccess
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-300"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            {addedSuccess ? (
              <span className="flex items-center gap-1.5 text-emerald-600">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Masuk Keranjang!</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 strokeWidth={2.2}" />
                <span>+ Keranjang</span>
              </span>
            )}
          </Button>

          {/* Tombol Utama: Pesan Sekarang -> Langsung ke Formulir Pemesanan */}
          <Button
            type="button"
            onClick={handleDirectOrder}
            className="flex-1 sm:flex-none h-11 sm:h-12 px-4 sm:px-6 rounded-xl bg-primary hover:bg-primary-dark text-white font-heading font-black text-xs sm:text-sm tracking-tight transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <Zap className="w-4 h-4 fill-amber-300 text-amber-300 shrink-0" />
            <span>Pesan Sekarang</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
