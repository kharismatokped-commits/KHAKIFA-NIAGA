"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, UnitType } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { RotateCcw, Plus, Check } from "lucide-react";

interface RepeatOrderItem {
  productVariantId: string;
  variantName: string;
  lastQty: number;
  lastUnit: UnitType;
  orderCount: number;
  totalQty: number;
  product: Product;
}

export const RepeatOrderSection: React.FC = () => {
  const [items, setItems] = useState<RepeatOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const { addItem } = useCart();

  useEffect(() => {
    if (typeof window === "undefined") return;

    let phone = localStorage.getItem("khalifa_customer_wa");
    if (!phone) {
      try {
        const savedCustomer = localStorage.getItem("khalifa_niaga_customer_v1");
        if (savedCustomer) {
          const parsed = JSON.parse(savedCustomer);
          if (parsed.whatsappNumber) {
            phone = parsed.whatsappNumber.replace(/[^0-9]/g, "");
          }
        }
      } catch (e) {
        // ignore parse error
      }
    }

    if (!phone) {
      setLoading(false);
      return;
    }

    fetch(`/api/customers/${encodeURIComponent(phone)}/repeat-order`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setItems(res.data);
        }
      })
      .catch((err) => console.error("Error fetching repeat orders:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (item: RepeatOrderItem) => {
    const variant = item.product.variants?.find(
      (v) => v.id === item.productVariantId
    );
    addItem(item.product, item.lastUnit, item.lastQty, variant);

    setAddedIds((prev) => ({ ...prev, [item.productVariantId]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.productVariantId]: false }));
    }, 1500);
  };

  // Sembunyikan total untuk pengunjung baru atau jika belum pernah ada pesanan
  if (!loading && items.length === 0) {
    return null;
  }

  if (loading) {
    return null; // Tidak menampilkan layout shift ke user baru
  }

  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-[#146C43]">
            <RotateCcw className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base text-[#1A1A1A] tracking-tight">
              Pesan Lagi
            </h3>
            <p className="font-sans text-[13px] text-[#6B7280]">
              Produk yang sering Anda pesan untuk kulakan
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel (1 Baris Scroll) */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {items.map((item) => {
          const isAdded = addedIds[item.productVariantId];
          const imgSrc =
            item.product.images?.[0] || "/placeholders/atk.svg";

          return (
            <div
              key={item.productVariantId}
              className="min-w-[190px] max-w-[210px] bg-white border border-[#E5E7EB] rounded-2xl p-3 shadow-sm flex flex-col justify-between shrink-0 group hover:border-[#146C43] transition-colors"
            >
              <div>
                <Link
                  href={`/produk/${item.product.id}`}
                  className="block relative aspect-square w-full rounded-xl overflow-hidden bg-[#F5F7F6] mb-2 border border-[#E5E7EB]"
                >
                  <Image
                    src={imgSrc}
                    alt={item.product.name}
                    fill
                    sizes="(max-width: 640px) 190px, 210px"
                    className="object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-1.5 left-1.5 bg-[#1A1A1A]/80 backdrop-blur-xs text-white font-sans text-[10px] font-medium px-2 py-0.5 rounded-md">
                    {item.lastQty} {item.lastUnit}
                  </div>
                </Link>

                <Link href={`/produk/${item.product.id}`}>
                  <h4 className="font-heading font-medium text-[14px] text-[#1A1A1A] line-clamp-2 leading-snug group-hover:text-[#146C43] transition-colors">
                    {item.product.name}
                  </h4>
                </Link>

                {item.variantName && item.variantName !== "Standar" && (
                  <p className="font-sans text-[11px] text-[#6B7280] mt-0.5 line-clamp-1">
                    Varian: {item.variantName}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => handleAddToCart(item)}
                  disabled={isAdded}
                  className={`w-full h-[40px] rounded-xl font-heading font-medium text-[13px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isAdded
                      ? "bg-emerald-600 text-white"
                      : "bg-[#146C43] text-white hover:bg-[#0f5333] active:scale-95 shadow-sm"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" strokeWidth={2} />
                      <span>Masuk Keranjang</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" strokeWidth={2} />
                      <span>
                        + {item.lastQty} {item.lastUnit}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
