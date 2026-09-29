"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  PenLine,
  Home,
  Package,
  Store,
  Grid2x2,
  LayoutGrid,
} from "lucide-react";

interface CategoryData {
  id: string;
  nama: string;
  kodeAsal?: string | null;
  ikon?: string;
  _count?: {
    products: number;
  };
}

function getCategoryIcon(cat: CategoryData) {
  const code = (cat.kodeAsal || "").toUpperCase();
  const name = (cat.nama || "").toLowerCase();

  // ATK -> PenLine
  if (code === "ATK" || name.includes("tulis") || name.includes("atk")) {
    return PenLine;
  }
  // Rumah Tangga -> Home
  if (code === "RT" || name.includes("rumah") || name.includes("tangga")) {
    return Home;
  }
  // Plastik & Kemasan -> Package
  if (code === "PLASTIK" || name.includes("plastik") || name.includes("kemasan")) {
    return Package;
  }
  // Kelontong -> Store
  if (code === "KELONTONG" || name.includes("kelontong") || name.includes("sembako")) {
    return Store;
  }
  // Lainnya (Listrik, Mainan, Olahraga, Aksesoris) -> Grid2x2
  return Grid2x2;
}

export const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          // Urutkan kategori berdasarkan jumlah produk terbanyak
          const sorted = [...data.data].sort((a, b) => {
            const countA = a._count?.products ?? 0;
            const countB = b._count?.products ?? 0;
            return countB - countA;
          });
          // Ambil hingga 15 kategori (+ 1 tombol Semua Kategori = total kelipatan 4 untuk grid icon 4x4)
          setCategories(sorted.slice(0, 15));
        }
      })
      .catch((err) => console.error("Error loading categories:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading && categories.length === 0) {
    return (
      <div className="grid grid-cols-4 gap-y-3.5 gap-x-2 sm:gap-4 py-1">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F5F7F6] border border-[#E5E7EB] animate-pulse" />
            <div className="w-12 h-3 bg-[#F5F7F6] rounded mt-2 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-4 gap-y-3.5 sm:gap-y-4 gap-x-2 sm:gap-x-4 py-1">
      {categories.map((cat) => {
        const IconComponent = getCategoryIcon(cat);
        return (
          <Link
            key={cat.id}
            href={`/katalog?kategori=${cat.id}`}
            className="flex flex-col items-center group active:scale-95 transition-transform"
          >
            {/* Kotak Squircle rounded-2xl dengan Ikon Lucide strokeWidth 2 */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-sm border border-[#E5E7EB] flex items-center justify-center group-hover:border-[#146C43] group-hover:bg-[#F5F7F6] group-hover:scale-105 transition-all">
              <IconComponent
                className="w-6 h-6 sm:w-7 sm:h-7 text-[#146C43] group-hover:scale-110 transition-transform"
                strokeWidth={2}
              />
            </div>

            {/* Label Teks Kategori (Inter 11px) */}
            <span className="font-sans font-medium text-[11px] text-[#1A1A1A] group-hover:text-[#146C43] text-center leading-tight mt-1.5 line-clamp-2 max-w-[80px] transition-colors">
              {cat.nama}
            </span>
          </Link>
        );
      })}

      {/* Tombol Semua Kategori di Akhir Grid */}
      <Link
        href="/katalog"
        className="flex flex-col items-center group active:scale-95 transition-transform"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F5F7F6] shadow-sm border border-[#E5E7EB] flex items-center justify-center group-hover:border-[#146C43] group-hover:bg-emerald-50/50 group-hover:scale-105 transition-all">
          <LayoutGrid
            className="w-6 h-6 sm:w-7 sm:h-7 text-[#146C43] group-hover:scale-110 transition-transform"
            strokeWidth={2}
          />
        </div>
        <span className="font-sans font-semibold text-[11px] text-[#146C43] text-center leading-tight mt-1.5 line-clamp-2 max-w-[80px] transition-colors">
          Semua Kategori
        </span>
      </Link>
    </div>
  );
};
