"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { formatRupiah } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, Trash2, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function KeranjangPage() {
  const {
    items,
    updateQty,
    removeItem,
    clearCart,
    toggleSelect,
    selectAll,
    selectedTotalCount,
    selectedTotalAmount,
    selectedOrderType,
  } = useCart();

  const allSelected = items.length > 0 && items.every((item) => item.selected);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 my-8 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#146C43] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-gray-900">
          Keranjang Belanja Masih Kosong
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Anda belum memilih barang dagangan untuk dikulak. Silakan jelajahi katalog produk kami untuk melihat penawaran harga grosir terbaik.
        </p>
        <div className="pt-2">
          <Link href="/katalog">
            <Button size="lg" className="font-bold text-xs">
              <span>Mulai Belanja Grosir Sekarang</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-12">
      {/* Header Halaman Dinamis */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {selectedOrderType === "grosir" ? "Keranjang Belanja Grosir" : "Keranjang Belanja"}
          </h2>
          <p className="text-xs text-gray-500">
            Periksa kuantitas dan harga satuan bertingkat sebelum checkout
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 font-semibold transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Kosongkan Keranjang</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Daftar Barang */}
        <div className="lg:col-span-8 space-y-3">
          {/* Select All Row */}
          <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => selectAll(e.target.checked)}
                className="w-4 h-4 rounded text-[#146C43] focus:ring-[#146C43] border-gray-300 cursor-pointer"
              />
              <span>Pilih Semua Barang ({items.length})</span>
            </label>

            <span className="text-gray-500 text-[11px]">
              {selectedTotalCount} item terpilih
            </span>
          </div>

          {/* List of Cart Items */}
          <div className="space-y-2.5">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQty={(newQty) => updateQty(item.id, newQty)}
                onRemove={() => removeItem(item.id)}
                onToggleSelect={() => toggleSelect(item.id)}
              />
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link
              href="/katalog"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#146C43] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tambah Barang Lainnya</span>
            </Link>
          </div>
        </div>

        {/* Kolom Kanan: Ringkasan Total & CTA */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4 sticky top-24">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-extrabold text-base text-gray-900">
              Ringkasan Pesanan
            </h3>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                selectedOrderType === "grosir"
                  ? "bg-emerald-100 text-[#146C43] border border-emerald-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {selectedOrderType === "grosir" ? "Pesanan Grosir" : "Pesanan Eceran"}
            </span>
          </div>

          <div className="space-y-2 text-[12px] sm:text-[13px]">
            <div className="flex justify-between text-gray-600">
              <span>Total Kuantitas</span>
              <span className="font-bold text-gray-900">{selectedTotalCount} item</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Estimasi Ongkir</span>
              <span className="text-emerald-700 font-medium">Dihitung manual via WA</span>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-[13px] font-bold text-gray-900">Total Harga</span>
              <span className="font-price text-[16px] sm:text-[18px] font-bold text-[#146C43]">
                {formatRupiah(selectedTotalAmount)}
              </span>
            </div>
          </div>

          {/* Info Garansi Discrepancy */}
          <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 text-[11px] sm:text-[12px] text-emerald-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#146C43] shrink-0 mt-0.5" strokeWidth={2} />
            <span>
              <strong>Garansi 0% Selisih:</strong> Total belanja di aplikasi ini sama persis dengan rincian pesan WhatsApp toko.
            </span>
          </div>

          <Link href="/checkout" className="block">
            <Button
              size="lg"
              disabled={selectedTotalCount === 0}
              className="w-full h-12 font-medium text-[13px] sm:text-[14px] tracking-normal bg-[#146C43] hover:bg-[#115b38] shadow-md"
            >
              <span>
                {selectedOrderType === "grosir" ? "Lanjut ke Form Pemesanan Grosir" : "Lanjut ke Form Pemesanan"}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" strokeWidth={2.2} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
