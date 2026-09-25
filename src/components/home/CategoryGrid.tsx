"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Home, Package, Store, LayoutGrid } from "lucide-react";

interface CategoryData {
  id: string;
  nama: string;
  ikon: string;
}

function getCategoryIcon(id: string) {
  switch (id) {
    case "atk":
      return BookOpen;
    case "rumah-tangga":
      return Home;
    case "plastik-kemasan":
      return Package;
    case "kelontong":
      return Store;
    default:
      return LayoutGrid;
  }
}

export const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setCategories(data.data);
        }
      })
      .catch((err) => console.error("Error loading categories:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading && categories.length === 0) {
    return (
      <div className="grid grid-cols-5 gap-1.5 sm:gap-3 py-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-[18px] sm:rounded-2xl bg-gray-100 animate-pulse" />
            <div className="w-10 h-3 bg-gray-100 rounded mt-1.5 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-3 py-1">
      {categories.map((cat) => {
        const IconComponent = getCategoryIcon(cat.id);
        return (
          <Link
            key={cat.id}
            href={`/katalog?kategori=${cat.id}`}
            className="flex flex-col items-center group active:scale-95 transition-transform"
          >
            {/* Kotak Putih Squircle dengan Ikon Lucide Outline Tebal */}
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-[18px] sm:rounded-2xl bg-white shadow-xs border border-gray-200/80 flex items-center justify-center group-hover:border-primary group-hover:bg-emerald-50/40 group-hover:scale-105 group-hover:shadow-md transition-all">
              <IconComponent
                className="w-6 h-6 sm:w-7 sm:h-7 text-primary group-hover:scale-110 transition-transform"
                strokeWidth={2.2}
              />
            </div>

            {/* Label Teks di Bawah Kotak */}
            <span className="font-heading font-medium text-[12px] sm:text-[13px] text-gray-800 group-hover:text-primary text-center leading-tight mt-1.5 line-clamp-2 max-w-[72px] whitespace-pre-line transition-colors">
              {cat.nama}
            </span>
          </Link>
        );
      })}
    </div>
  );
};
