import React from "react";
import Link from "next/link";
import { BookOpen, Home, Package, Store, LayoutGrid } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; color?: string }>;
}

const CATEGORY_ITEMS: CategoryItem[] = [
  { id: "atk", name: "ATK", icon: BookOpen },
  { id: "rumah-tangga", name: "Rumah Tangga", icon: Home },
  { id: "plastik-kemasan", name: "Plastik &\nKemasan", icon: Package },
  { id: "kelontong", name: "Kelontong", icon: Store },
  { id: "lainnya", name: "Lainnya", icon: LayoutGrid },
];

export const CategoryGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-3 py-1">
      {CATEGORY_ITEMS.map((cat) => {
        const IconComponent = cat.icon;
        return (
          <Link
            key={cat.id}
            href={`/katalog?kategori=${cat.id}`}
            className="flex flex-col items-center group active:scale-95 transition-transform"
          >
            {/* Kotak Putih Squircle dengan Ikon Lucide Outline Tebal (Minimal 24px) */}
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-[18px] sm:rounded-2xl bg-white shadow-xs border border-gray-200/80 flex items-center justify-center group-hover:border-[#146C43] group-hover:bg-emerald-50/40 group-hover:scale-105 group-hover:shadow-md transition-all">
              <IconComponent
                className="w-6 h-6 sm:w-7 sm:h-7 text-[#146C43] group-hover:scale-110 transition-transform"
                strokeWidth={2.2}
              />
            </div>

            {/* Label Teks di Bawah Kotak (12–13px) */}
            <span className="font-heading font-medium text-[12px] sm:text-[13px] text-gray-800 group-hover:text-[#146C43] text-center leading-tight mt-1.5 line-clamp-2 max-w-[72px] whitespace-pre-line transition-colors">
              {cat.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
};
