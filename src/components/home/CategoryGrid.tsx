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
  Sparkles,
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
  if (code === "AKS" || name.includes("aksesoris")) {
    return Sparkles;
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
          // Urutkan kategori berdasarkan jumlah produk terbanyak
          const sorted = [...data.data].sort((a, b) => {
            const countA = a._count?.products ?? 0;
            const countB = b._count?.products ?? 0;
            return countB - countA;
          });
          // Ambil hingga 15 kategori (+ 1 tombol Semua Kategori = 16 item / grid 4x4)
          // Jika ada 7 kategori (+ 1 tombol = 8 item / grid 4x2)
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
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] sm:rounded-2xl bg-gray-100 animate-pulse" />
            <div className="w-12 h-3 bg-gray-100 rounded mt-2 animate-pulse" />
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
            {/* Kotak Putih Squircle dengan Ikon Lucide Outline Tebal */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] sm:rounded-2xl bg-white shadow-xs border border-gray-200/80 flex items-center justify-center group-hover:border-primary group-hover:bg-emerald-50/40 group-hover:scale-105 group-hover:shadow-md transition-all">
              <IconComponent
                className="w-6 h-6 sm:w-7 sm:h-7 text-primary group-hover:scale-110 transition-transform"
                strokeWidth={2.2}
              />
            </div>

            {/* Label Teks di Bawah Kotak */}
            <span className="font-heading font-medium text-[11px] sm:text-[12px] text-gray-800 group-hover:text-primary text-center leading-tight mt-1.5 line-clamp-2 max-w-[80px] transition-colors">
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
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] sm:rounded-2xl bg-emerald-50 shadow-xs border border-emerald-200 flex items-center justify-center group-hover:border-primary group-hover:bg-emerald-100 group-hover:scale-105 group-hover:shadow-md transition-all">
          <LayoutGrid
            className="w-6 h-6 sm:w-7 sm:h-7 text-primary group-hover:scale-110 transition-transform"
            strokeWidth={2.2}
          />
        </div>
        <span className="font-heading font-bold text-[11px] sm:text-[12px] text-primary text-center leading-tight mt-1.5 line-clamp-2 max-w-[80px] transition-colors">
          Semua Kategori
        </span>
      </Link>
    </div>
  );
};
