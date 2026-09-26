"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { Sparkles, ArrowRight } from "lucide-react";

import { ProductListSkeleton } from "@/components/product/ProductCardSkeleton";

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
    popularProducts.length > 0 ? popularProducts : products.slice(0, 4);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-[#F57C00]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-gray-900 tracking-tight">
              Produk Terlaris & Rekomendasi
            </h3>
            <p className="text-[12px] text-gray-500">
              Pilihan cepat untuk stok etalase toko dan warung Anda
            </p>
          </div>
        </div>

        <Link
          href="/katalog"
          className="text-[12px] font-medium text-primary hover:underline flex items-center gap-0.5"
        >
          <span>Semua</span>
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} />
        </Link>
      </div>

      {/* 1 Kolom List Vertikal */}
      {loading ? (
        <ProductListSkeleton count={4} />
      ) : displayProducts.length > 0 ? (
        <div className="flex flex-col space-y-3">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
          Belum ada produk rekomendasi yang tersedia.
        </div>
      )}
    </div>
  );
};
