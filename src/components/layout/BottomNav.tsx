"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { totalItemsCount } = useCart();

  const navItems = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/katalog", label: "Kategori", icon: LayoutGrid },
    { href: "/keranjang", label: "Keranjang", icon: ShoppingBag, badge: totalItemsCount },
    { href: "/info-toko", label: "Akun", icon: User },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200/90 shadow-lg pb-safe">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors relative py-1 ${
                isActive
                  ? "text-[#146C43] font-bold"
                  : "text-[#64748B] hover:text-gray-900"
              }`}
            >
              <div className="relative">
                {/* Ukuran minimal 24px, strokeWidth 2.2 / 2.5 */}
                <Icon
                  className="w-6 h-6"
                  strokeWidth={isActive ? 2.5 : 2}
                  color={isActive ? "#146C43" : "#64748B"}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#E53935] text-white text-[10px] font-black shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              {/* Label teks selalu ada di bawah ikon */}
              <span className={`text-[11px] leading-tight ${isActive ? "font-bold text-[#146C43]" : "font-medium text-[#64748B]"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
