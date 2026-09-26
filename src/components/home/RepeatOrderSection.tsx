"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, UnitType } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { RotateCcw, Plus, Check, ShoppingBag } from "lucide-react";

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
          <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-primary">
            <RotateCcw className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-base text-gray-900 tracking-tight">
              Pesan Lagi
            </h3>
            <p className="text-[12px] text-gray-500">
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
              className="min-w-[190px] max-w-[210px] bg-white border border-gray-100 rounded-2xl p-3 shadow-xs flex flex-col justify-between shrink-0 group hover:border-primary/40 transition-colors"
            >
              <div>
                <Link
                  href={`/produk/${item.product.id}`}
                  className="block relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-2 border border-gray-100/80"
                >
                  <Image
                    src={imgSrc}
                    alt={item.product.name}
                    fill
                    sizes="(max-width: 640px) 190px, 210px"
                    className="object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-1.5 left-1.5 bg-gray-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    {item.lastQty} {item.lastUnit}
                  </div>
                </Link>

                <Link href={`/produk/${item.product.id}`}>
                  <h4 className="font-heading font-bold text-xs text-gray-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {item.product.name}
                  </h4>
                </Link>

                {item.variantName && item.variantName !== "Standar" && (
                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                    Varian: {item.variantName}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => handleAddToCart(item)}
                  disabled={isAdded}
                  className={`w-full py-2 px-2.5 rounded-xl font-heading font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isAdded
                      ? "bg-emerald-600 text-white"
                      : "bg-primary text-white hover:bg-emerald-700 active:scale-95"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Masuk Keranjang</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
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
