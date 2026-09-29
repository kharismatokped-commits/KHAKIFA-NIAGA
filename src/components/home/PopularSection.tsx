"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { Star, ArrowRight } from "lucide-react";

interface PopularSectionProps {
  products?: Product[];
}

export const PopularSection: React.FC<PopularSectionProps> = ({
  products: initialProducts,
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(
    !initialProducts || initialProducts.length === 0,
  );

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    fetch("/api/products?limit=8")
      .then((res) => res.json())
      .then((data) => {
        if (data.customerProducts) {
          setProducts(data.customerProducts);
        }
      })
      .catch((err) => console.error("Error fetching popular products:", err))
      .finally(() => setLoading(false));
  }, [initialProducts]);

  const popularProducts = products.filter((p) => p.isPopular);
  const displayProducts =
    popularProducts.length >= 6
      ? popularProducts.slice(0, 8)
      : products.slice(0, 8);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#FBBF24]">
            <Star className="w-4 h-4 fill-[#FBBF24]" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base text-[#1A1A1A] tracking-tight">
              Produk Terlaris
            </h3>
            <p className="font-sans text-[13px] text-[#6B7280]">
              Pilihan cepat untuk stok etalase toko dan warung Anda
            </p>
          </div>
        </div>

        <Link
          href="/katalog"
          className="font-heading font-medium text-[12px] text-[#146C43] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Semua</span>
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
        </Link>
      </div>

      {/* List Produk */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-3 animate-pulse space-y-2"
            >
              <div className="h-28 bg-[#F5F7F6] rounded-xl" />
            </div>
          ))}
        </div>
      ) : displayProducts.length > 0 ? (
        <div className="flex flex-col space-y-3">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-[#6B7280] bg-white rounded-2xl border border-[#E5E7EB]">
          Belum ada produk terlaris yang tersedia.
        </div>
      )}

      {/* Tombol Lihat Semua Produk */}
      <div className="pt-1">
        <Link
          href="/katalog"
          className="w-full h-[44px] rounded-xl border border-[#146C43] bg-emerald-50/50 hover:bg-emerald-100 text-[#146C43] font-heading font-medium text-[14px] flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm"
        >
          <span>Lihat Semua Produk ({products.length > 0 ? "480+ Produk" : "Katalog Lengkap"})</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
};
