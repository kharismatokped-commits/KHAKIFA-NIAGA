"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";

interface CategoryData {
  id: string;
  nama: string;
  kodeAsal?: string | null;
  ikon?: string;
  _count?: {
    products: number;
  };
}

// Mapping 3D icon (Microsoft Fluent Emoji, MIT license)
const ICON_3D_MAP: Record<string, string> = {
  ATK: "/icons/3d/atk.png",             // ✏️ Pencil
  RT: "/icons/3d/rumah-tangga.png",     // 🏠 House
  plastik: "/icons/3d/plastik.png",     // 📦 Package
  kelontong: "/icons/3d/keranjang.png", // 🛒 Shopping Cart
  LT: "/icons/3d/listrik.png",          // ⚡ High Voltage
  MNA: "/icons/3d/mainan.png",          // 🧸 Teddy Bear
  OLR: "/icons/3d/olahraga.png",        // ⚽ Soccer Ball
  AKS: "/icons/3d/aksesoris.png",       // 🛍️ Shopping Bags
};

const BG_MAP: Record<string, string> = {
  ATK: "#EAF3DE",
  RT: "#EAF3DE",
  plastik: "#EAF3DE",
  kelontong: "#EAF3DE",
  LT: "#FEF3C7",
  MNA: "#FEE2E2",
  OLR: "#DBEAFE",
  AKS: "#F3E8FF",
};

function getIcon3D(cat: CategoryData): string {
  const code = (cat.kodeAsal || "").toLowerCase() === "plastik"
    ? "plastik"
    : (cat.kodeAsal || "");
  return ICON_3D_MAP[code] || "/icons/3d/aksesoris.png";
}

function getBg(cat: CategoryData): string {
  const code = cat.kodeAsal || "";
  return BG_MAP[code] || "#EAF3DE";
}

export const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          // Filter yang punya produk, urutkan terbanyak, ambil 7 (+ 1 "Semua" = 8 → 4×2 di grid 4)
          const sorted = [...data.data]
            .filter((c) => (c._count?.products ?? 0) > 0)
            .sort((a, b) => {
              const countA = a._count?.products ?? 0;
              const countB = b._count?.products ?? 0;
              return countB - countA;
            })
            .slice(0, 7);
          setCategories(sorted);
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
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-[19px] animate-pulse"
              style={{ background: "#E9ECF6", boxShadow: "inset 4px 4px 9px rgba(163,177,198,0.28), inset -4px -4px 9px rgba(255,255,255,0.92)" }}
            />
            <div className="w-12 h-3 rounded mt-2 animate-pulse" style={{ background: "#E9ECF6" }} />
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
        const iconSrc = getIcon3D(cat);
        const bgColor = getBg(cat);
        return (
          <Link
            key={cat.id}
            href={`/katalog?kategori=${cat.id}`}
            className="flex flex-col items-center group active:scale-95 transition-transform"
          >
            {/* Tile Neumorphic + Glossy overlay */}
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-[19px] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-all"
              style={{
                backgroundColor: bgColor,
                boxShadow: "6px 6px 14px rgba(163,177,198,0.30), -6px -6px 14px rgba(255,255,255,0.92)",
              }}
            >
              <span
                style={{
                  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.14)) drop-shadow(0 1px 2px rgba(0,0,0,0.08))",
                  display: "inline-flex", position: "relative", zIndex: 1,
                }}
              >
                <Image
                  src={iconSrc}
                  alt={cat.nama}
                  width={36}
                  height={36}
                  className="object-contain w-8 h-8 sm:w-9 sm:h-9"
                  unoptimized
                />
              </span>
              {/* Overlay gloss putih — efek 3D glossy */}
              <div
                className="absolute inset-0 rounded-[19px] pointer-events-none"
                style={{
                  background: "linear-gradient(155deg, rgba(255,255,255,0.55) 50%, transparent 62%)",
                }}
              />
            </div>

            {/* Label */}
            <span className="font-sans font-bold text-[10.5px] text-[#8A8FA8] group-hover:text-[#146C43] text-center leading-tight mt-1.5 line-clamp-2 max-w-[80px] transition-colors">
              {cat.nama}
            </span>
          </Link>
        );
      })}

      {/* Tombol Semua Kategori — inset (tenggelam) */}
      <Link
        href="/katalog"
        className="flex flex-col items-center group active:scale-95 transition-transform"
      >
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-[19px] flex items-center justify-center group-hover:scale-105 transition-all"
          style={{
            background: "#E9ECF6",
            boxShadow: "inset 4px 4px 9px rgba(163,177,198,0.28), inset -4px -4px 9px rgba(255,255,255,0.92)",
          }}
        >
          <LayoutGrid
            className="w-6 h-6 sm:w-7 sm:h-7 text-[#146C43] group-hover:scale-110 transition-transform"
            strokeWidth={2}
          />
        </div>
        <span className="font-sans font-bold text-[10.5px] text-[#146C43] text-center leading-tight mt-1.5 line-clamp-2 max-w-[80px] transition-colors">
          Semua Kategori
        </span>
      </Link>
    </div>
  );
};
