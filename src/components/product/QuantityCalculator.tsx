"use client";

import React, { useState } from "react";
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
  Package,
  Box,
} from "lucide-react";

interface QuantityCalculatorProps {
  product: Product;
  selectedVariant?: ProductVariant;
  unitType: UnitType;
  onUnitTypeChange: (unit: UnitType) => void;
  qty: number;
  onQtyChange: (newQty: number) => void;
}

export const QuantityCalculator: React.FC<QuantityCalculatorProps> = ({
  product,
  selectedVariant,
  unitType,
  onUnitTypeChange,
  qty,
  onQtyChange,
}) => {
  const { addItem } = useCart();
  const [addedSuccess, setAddedSuccess] = useState(false);

  const tiers =
    unitType === "PAK" ? product.tieredPricesPack : product.tieredPricesPcs;
  const unitPrice = getUnitPrice(tiers, qty);
  const subtotal = qty * unitPrice;
  const nextTier = getNextTierRecommendation(tiers, qty);

  const unitLabel =
    unitType === "PAK" ? product.unitPackName : product.unitPcsName;

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
    addItem(product, unitType, qty, selectedVariant);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 1800);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-4">
      {/* Tab Pilihan Satuan Kemasan: PCS vs PAK */}
      <div>
        <label className="text-xs font-bold text-gray-700 block mb-2">
          Pilih Satuan Kemasan:
        </label>
        <div className="grid grid-cols-2 gap-2">
          {product.hasPcs && (
            <button
              type="button"
              onClick={() => onUnitTypeChange("PCS")}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-[12px] sm:text-[13px] font-medium transition-all ${
                unitType === "PCS"
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <Box className="w-4 h-4" strokeWidth={2.2} />
              <span>Satuan {product.unitPcsName}</span>
            </button>
          )}

          {product.hasPack && (
            <button
              type="button"
              onClick={() => onUnitTypeChange("PAK")}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-[12px] sm:text-[13px] font-medium transition-all ${
                unitType === "PAK"
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <Package className="w-4 h-4" strokeWidth={2.2} />
              <span>
                Satuan {product.unitPackName} (Isi {product.packRatio})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Stepper Jumlah */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] sm:text-[13px] font-medium text-gray-700">
            Atur Jumlah Pembelian ({unitLabel}):
          </label>
          <span className="text-[13px] font-bold text-primary">
            Harga Satuan: {formatRupiah(unitPrice)}/{unitLabel}
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
              <Minus className="w-5 h-5" strokeWidth={2.2} />
            </button>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={handleDirectInput}
              className="w-18 h-12 text-center font-bold text-[16px] text-gray-900 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleIncrement}
              className="w-12 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Tambah Jumlah"
            >
              <Plus className="w-5 h-5" strokeWidth={2.2} />
            </button>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {[10, 24, 50, 100].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onQtyChange(preset)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-[12px] sm:text-[13px] font-medium border transition-colors ${
                  qty === preset
                    ? "bg-emerald-50 text-primary border-primary shadow-xs"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                +{preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rekomendasi Upsell Tier Berikutnya */}
      {nextTier && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-[12px] sm:text-[13px] text-amber-900">
          <div className="flex items-center gap-2">
            <TrendingDown
              className="w-4 h-4 text-[#F57C00] shrink-0"
              strokeWidth={2.2}
            />
            <span>
              Tambah{" "}
              <strong>
                {nextTier.moreNeeded} {unitLabel}
              </strong>{" "}
              lagi untuk dapat harga{" "}
              <strong>{formatRupiah(nextTier.nextPrice)}</strong>!
            </span>
          </div>
          <button
            type="button"
            onClick={() => onQtyChange(nextTier.targetQty)}
            className="text-[12px] sm:text-[13px] font-bold text-[#F57C00] underline hover:text-amber-800 shrink-0 ml-2"
          >
            Ambil Diskon
          </button>
        </div>
      )}

      {/* Kalkulasi Total & Tombol Tambah ke Keranjang */}
      <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[12px] text-gray-500 font-normal">
            Subtotal Pesanan:
          </div>
          <div className="font-price text-[16px] sm:text-[18px] font-bold text-primary tracking-tight">
            {formatRupiah(subtotal)}
          </div>
          <div className="text-[11px] sm:text-[12px] text-gray-500 font-normal">
            ({qty} {unitLabel} × {formatRupiah(unitPrice)})
          </div>
        </div>

        <Button
          type="button"
          onClick={handleAddToCart}
          size="lg"
          className={`w-full sm:w-auto min-w-[220px] min-h-[48px] h-12 text-[13px] sm:text-[14px] font-medium shadow-md transition-all ${
            addedSuccess
              ? "bg-primary-dark hover:bg-primary-darker text-white ring-2 ring-emerald-300"
              : "bg-primary hover:bg-primary-dark text-white"
          }`}
        >
          {addedSuccess ? (
            <>
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Berhasil Ditambahkan!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" strokeWidth={2.2} />
              <span>+ Masukkan ke Keranjang</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
