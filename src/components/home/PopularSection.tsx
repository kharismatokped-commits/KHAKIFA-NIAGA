"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { Sparkles, ArrowRight } from "lucide-react";

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
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-[#F57C00]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-base text-gray-900 tracking-tight">
              Produk Terlaris
            </h3>
            <p className="text-[12px] text-gray-500">
              Pilihan cepat untuk stok etalase toko dan warung Anda
            </p>
          </div>
        </div>

        <Link
          href="/katalog"
          className="text-[12px] font-medium text-primary hover:underline flex items-center gap-0.5 shrink-0"
        >
          <span>Semua</span>
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} />
        </Link>
      </div>

      {/* 2 Kolom Grid Responsif */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-3 animate-pulse space-y-2"
            >
              <div className="aspect-square bg-gray-100 rounded-xl" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-8 bg-gray-100 rounded-xl mt-2" />
            </div>
          ))}
        </div>
      ) : displayProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
          Belum ada produk terlaris yang tersedia.
        </div>
      )}

      {/* Tombol Lihat Semua Produk */}
      <div className="pt-1">
        <Link
          href="/katalog"
          className="w-full py-3 px-4 rounded-xl border border-primary/20 bg-emerald-50/70 hover:bg-emerald-100 text-primary font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs"
        >
          <span>Lihat Semua Produk ({products.length > 0 ? "480+ Produk" : "Katalog Lengkap"})</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
        </Link>
      </div>
    </div>
  );
};
