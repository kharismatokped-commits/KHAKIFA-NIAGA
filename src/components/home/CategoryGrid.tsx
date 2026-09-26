"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Home,
  Package,
  Zap,
  Gamepad2,
  Trophy,
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

  if (code === "ATK" || name.includes("tulis") || name.includes("atk")) {
    return BookOpen;
  }
  if (code === "RT" || name.includes("rumah") || name.includes("tangga")) {
    return Home;
  }
  if (code === "PLASTIK" || name.includes("plastik") || name.includes("kemasan")) {
    return Package;
  }
  if (code === "LT" || name.includes("listrik") || name.includes("perkakas")) {
    return Zap;
  }
  if (code === "MNA" || name.includes("mainan")) {
    return Gamepad2;
  }
  if (code === "OLR" || name.includes("olahraga")) {
    return Trophy;
  }
  return LayoutGrid;
}

export const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          // Urutkan kategori berdasarkan jumlah produk terbanyak jika ada, atau batas 6-7
          const sorted = [...data.data].sort((a, b) => {
            const countA = a._count?.products ?? 0;
            const countB = b._count?.products ?? 0;
            return countB - countA;
          });
          setCategories(sorted.slice(0, 7));
        }
      })
      .catch((err) => console.error("Error loading categories:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-start gap-2.5 sm:gap-3.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center shrink-0 min-w-[72px] sm:min-w-[80px]"
          >
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-[18px] sm:rounded-2xl bg-gray-100 animate-pulse" />
            <div className="w-12 h-3 bg-gray-100 rounded mt-1.5 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex items-start gap-2.5 sm:gap-3.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
      {categories.map((cat) => {
        const IconComponent = getCategoryIcon(cat);
        return (
          <Link
            key={cat.id}
            href={`/katalog?kategori=${cat.id}`}
            className="flex flex-col items-center shrink-0 min-w-[72px] sm:min-w-[80px] max-w-[80px] group active:scale-95 transition-transform"
          >
            {/* Kotak Putih Squircle dengan Ikon Lucide Outline Tebal */}
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-[18px] sm:rounded-2xl bg-white shadow-xs border border-gray-200/80 flex items-center justify-center group-hover:border-primary group-hover:bg-emerald-50/40 group-hover:scale-105 group-hover:shadow-md transition-all">
              <IconComponent
                className="w-6 h-6 sm:w-7 sm:h-7 text-primary group-hover:scale-110 transition-transform"
                strokeWidth={2.2}
              />
            </div>

            {/* Label Teks di Bawah Kotak */}
            <span className="font-heading font-medium text-[11px] sm:text-[12px] text-gray-800 group-hover:text-primary text-center leading-tight mt-1.5 line-clamp-2 max-w-[72px] whitespace-pre-line transition-colors">
              {cat.nama}
            </span>
          </Link>
        );
      })}

      {/* Tombol Semua Kategori di Akhir Baris Scroll */}
      <Link
        href="/katalog"
        className="flex flex-col items-center shrink-0 min-w-[72px] sm:min-w-[80px] max-w-[80px] group active:scale-95 transition-transform"
      >
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-[18px] sm:rounded-2xl bg-emerald-50 shadow-xs border border-emerald-200 flex items-center justify-center group-hover:border-primary group-hover:bg-emerald-100 group-hover:scale-105 group-hover:shadow-md transition-all">
          <LayoutGrid
            className="w-6 h-6 sm:w-7 sm:h-7 text-primary group-hover:scale-110 transition-transform"
            strokeWidth={2.2}
          />
        </div>
        <span className="font-heading font-bold text-[11px] sm:text-[12px] text-primary text-center leading-tight mt-1.5 line-clamp-2 max-w-[72px] transition-colors">
          Semua Kategori
        </span>
      </Link>
    </div>
  );
};
