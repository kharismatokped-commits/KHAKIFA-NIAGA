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
          {/* Ikon bintang — kotak neumorphic */}
          <div
            className="w-8 h-8 rounded-[13px] flex items-center justify-center"
            style={{
              background: "#F8F9FE",
              boxShadow: "6px 6px 14px rgba(163,177,198,0.30), -6px -6px 14px rgba(255,255,255,0.92)",
            }}
          >
            <Star className="w-4 h-4 fill-[#F5B301] text-[#F5B301]" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-[15px] text-[#1F2340] tracking-tight" style={{ letterSpacing: "-0.3px" }}>
              Produk Terlaris
            </h3>
            <p className="font-sans text-[11px] text-[#8A8FA8]">
              Pilihan cepat untuk stok toko dan warung Anda
            </p>
          </div>
        </div>

        <Link
          href="/katalog"
          className="font-heading font-bold text-[12px] text-[#146C43] hover:underline flex items-center gap-1 shrink-0"
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
              className="rounded-[22px] p-3 animate-pulse space-y-2"
              style={{
                background: "#F8F9FE",
                boxShadow: "8px 8px 18px rgba(163,177,198,0.28), -6px -6px 16px rgba(255,255,255,0.90)",
              }}
            >
              <div className="h-28 rounded-[18px]" style={{ background: "#E9ECF6" }} />
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
        <div
          className="p-8 text-center text-xs text-[#8A8FA8] rounded-[22px]"
          style={{
            background: "#F8F9FE",
            boxShadow: "8px 8px 18px rgba(163,177,198,0.28), -6px -6px 16px rgba(255,255,255,0.90)",
          }}
        >
          Belum ada produk terlaris yang tersedia.
        </div>
      )}

      {/* Tombol Lihat Semua Produk — neumorphic raised */}
      <div className="pt-1">
        <Link
          href="/katalog"
          className="w-full h-[44px] rounded-[18px] font-heading font-bold text-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{
            background: "#F8F9FE",
            boxShadow: "6px 6px 14px rgba(163,177,198,0.30), -6px -6px 14px rgba(255,255,255,0.92)",
            color: "#146C43",
          }}
        >
          <span>Lihat Semua Produk ({products.length > 0 ? "480+ Produk" : "Katalog Lengkap"})</span>
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
};
