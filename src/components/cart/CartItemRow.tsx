"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CartItem } from "@/types/product";
import { formatRupiah } from "@/lib/formatters";
import { Trash2, Plus, Minus, Package, Box } from "lucide-react";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (newQty: number) => void;
  onRemove: () => void;
  onToggleSelect: () => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQty,
  onRemove,
  onToggleSelect,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-colors hover:border-primary">
      {/* Kolom Kiri: Checkbox, Gambar, Info Produk */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Checkbox Besar */}
        <input
          type="checkbox"
          checked={item.selected}
          onChange={onToggleSelect}
          className="w-5 h-5 mt-1.5 rounded text-primary focus:ring-primary border-gray-300 cursor-pointer"
        />

        {/* Gambar */}
        <div className="relative w-20 h-20 sm:w-20 sm:h-20 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
          <Image
            src={item.image}
            alt={item.productName}
            fill
            sizes="80px"
            className={
              item.image?.startsWith("/placeholders/")
                ? "object-contain p-2 bg-[#F9FBFA]"
                : "object-cover"
            }
          />
        </div>

        {/* Detail Produk */}
        <div className="min-w-0 flex-1">
          {/* Nama Produk 13–14px medium */}
          <Link
            href={`/produk/${item.productId}`}
            className="font-heading font-medium text-gray-900 text-[13px] sm:text-[14px] hover:text-primary transition-colors line-clamp-2 leading-snug"
          >
            {item.productName}
          </Link>

          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[12px] text-gray-600">
            {/* Satuan Tunggal PCS */}
            <span className="inline-flex items-center gap-1 font-semibold text-primary bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
              <Box className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Satuan Pcs</span>
            </span>

            {/* Varian Jenis Asli */}
            {item.variantName &&
              !["standar", "default", "pcs", "-pcs", "pak", "ktk"].includes(
                item.variantName.toLowerCase(),
              ) && (
                <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] text-gray-700 font-semibold">
                  Varian: {item.variantName}
                </span>
              )}
          </div>

          <div className="mt-1 text-[12px] text-gray-500 font-normal">
            Harga Satuan:{" "}
            <strong className="font-price font-bold text-gray-900">
              {formatRupiah(item.unitPrice)}
            </strong>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Stepper Qty & Subtotal */}
      <div className="flex items-center justify-between sm:justify-end gap-4 pl-8 sm:pl-0 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-gray-100">
        {/* Stepper +/- (Tinggi minimal 44px) */}
        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shadow-xs">
          <button
            type="button"
            onClick={() => onUpdateQty(item.qty - 1)}
            disabled={item.qty <= 1}
            className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Kurangi"
          >
            <Minus className="w-4 h-4" strokeWidth={2} />
          </button>
          <span className="w-11 text-center font-price font-bold text-[14px] text-gray-900">
            {item.qty}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQty(item.qty + 1)}
            className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Tambah"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Subtotal: 16px bold (elemen harga paling menonjol) */}
        <div className="text-right min-w-[110px]">
          <div className="text-[11px] text-gray-400 font-normal">Subtotal:</div>
          <div className="font-price font-bold text-primary text-[16px] tracking-tight">
            {formatRupiah(item.subtotal)}
          </div>
        </div>

        {/* Hapus button (Area sentuh minimal 44px) */}
        <button
          type="button"
          onClick={onRemove}
          className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
          title="Hapus dari keranjang"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};
