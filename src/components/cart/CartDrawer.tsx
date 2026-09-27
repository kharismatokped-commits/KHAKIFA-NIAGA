"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatRupiah } from "@/lib/formatters";
import { ShoppingCart, X, Trash2, ArrowRight, ShoppingBag } from "lucide-react";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const {
    items,
    updateQty,
    removeItem,
    clearCart,
    totalItemsCount,
    selectedTotalAmount,
  } = useCart();

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container (Bottom Sheet on mobile, Right Drawer on desktop) */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto max-h-[85vh] sm:max-h-none sm:w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-none shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-[#146C43] text-white rounded-t-2xl sm:rounded-none">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="font-semibold text-base">Keranjang Belanja</h2>
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {totalItemsCount}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#146C43] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                Keranjang Anda masih kosong
              </p>
              <p className="text-xs text-gray-400">
                Pilih produk dan tentukan jumlah untuk mulai belanja grosir.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 truncate uppercase">
                    {item.productName}
                  </h4>
                  {item.variantName && item.variantName !== "Standar" && (
                    <p className="text-[11px] text-gray-500">
                      Varian: {item.variantName}
                    </p>
                  )}
                  <p className="text-xs font-semibold text-[#146C43] mt-0.5">
                    {formatRupiah(item.subtotal)}
                  </p>
                </div>

                {/* Stepper */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 select-none text-xs font-bold"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-gray-800">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 select-none text-xs font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                  aria-label="Hapus item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-white space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total Pembelian:</span>
              <span className="text-base font-bold text-gray-900">
                {formatRupiah(selectedTotalAmount)}
              </span>
            </div>

            <div className="flex gap-2">
              <Link
                href="/keranjang"
                onClick={onClose}
                className="flex-1 py-2.5 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 text-center hover:bg-gray-50 transition-colors"
              >
                Lihat Detail
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="flex-2 py-2.5 px-3 bg-[#146C43] hover:bg-[#0f5333] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <span>Pesan Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
