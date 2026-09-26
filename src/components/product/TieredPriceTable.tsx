"use client";

import React from "react";
import { Product, UnitType } from "@/types/product";
import { formatRupiah } from "@/lib/formatters";
import { calculateSavings } from "@/lib/pricing";
import { Check, Box } from "lucide-react";

interface TieredPriceTableProps {
  product: Product;
  currentUnitType?: UnitType;
  currentQty: number;
  onSelectTier?: (unitType: UnitType, qty: number) => void;
}

export const TieredPriceTable: React.FC<TieredPriceTableProps> = ({
  product,
  currentQty,
  onSelectTier,
}) => {
  const basePcsPrice = product.tieredPricesPcs[0]?.price || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-black text-base sm:text-lg text-gray-900 tracking-tight">
            Pilihan Paket Harga Grosir (Satuan Pcs)
          </h3>
          <p className="text-xs text-gray-500">
            Sentuh kartu di bawah untuk langsung memilih tingkatan harga grosir:
          </p>
        </div>
      </div>

      {/* Bagian Satuan PCS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="font-heading font-bold text-sm text-gray-900 flex items-center gap-1.5">
            <Box className="w-4 h-4 text-primary" />
            <span>Tingkat Harga Grosir per Pcs</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {product.tieredPricesPcs.map((tier, idx) => {
            const isSelected =
              currentQty >= tier.minQty &&
              (tier.maxQty === null || currentQty <= tier.maxQty);

            const savings = calculateSavings(basePcsPrice, tier.price);
            const rangeLabel =
              tier.maxQty === null
                ? `Beli ≥ ${tier.minQty} pcs`
                : `Beli ${tier.minQty} - ${tier.maxQty} pcs`;

            return (
              <button
                key={`pcs-card-${idx}`}
                type="button"
                onClick={() =>
                  onSelectTier && onSelectTier("PCS", tier.minQty)
                }
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all min-h-[72px] flex items-center justify-between gap-3 shadow-xs active:scale-[0.98] ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-md ring-2 ring-emerald-300"
                    : "bg-white text-gray-900 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                      isSelected
                        ? "bg-white text-primary border-white"
                        : "border-gray-300 bg-gray-100 text-transparent"
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>

                  <div>
                    <div className="font-heading font-medium text-[13px] sm:text-[14px] leading-tight">
                      {rangeLabel}
                    </div>
                    <div
                      className={`text-[12px] mt-0.5 ${
                        isSelected ? "text-emerald-100" : "text-gray-500"
                      }`}
                    >
                      {savings > 0
                        ? `Hemat ${savings}% per pcs`
                        : "Harga Standar"}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`font-price font-bold text-[16px] tracking-tight ${
                      isSelected ? "text-white" : "text-primary"
                    }`}
                  >
                    {formatRupiah(tier.price)}
                  </div>
                  <div
                    className={`text-[11px] ${
                      isSelected ? "text-emerald-200" : "text-gray-400"
                    }`}
                  >
                    /pcs
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
