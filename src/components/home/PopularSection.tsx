import React from "react";
import Link from "next/link";
import { MOCK_PRODUCTS } from "@/data/mockProducts";
import { ProductCard } from "@/components/product/ProductCard";
import { Sparkles, ArrowRight } from "lucide-react";

export const PopularSection: React.FC = () => {
  const popularProducts = MOCK_PRODUCTS.filter((p) => p.isPopular);

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
          className="text-[12px] font-medium text-[#146C43] hover:underline flex items-center gap-0.5"
        >
          <span>Semua</span>
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} />
        </Link>
      </div>

      {/* 1 Kolom List Vertikal */}
      <div className="flex flex-col space-y-3">
        {popularProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
