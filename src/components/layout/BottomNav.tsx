"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { totalItemsCount } = useCart();

  // Sembunyikan bottom navigation di rute admin dan login
  if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  const navItems = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/katalog", label: "Kategori", icon: LayoutGrid },
    {
      href: "/keranjang",
      label: "Keranjang",
      icon: ShoppingCart,
      badge: totalItemsCount,
    },
    { href: "/info-toko", label: "Akun", icon: User },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] shadow-lg pb-safe">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-150 relative py-1 select-none active:scale-95 ${
                isActive
                  ? "text-[#146C43]"
                  : "text-[#6B7280] hover:text-[#1A1A1A]"
              }`}
            >
              <div className="relative">
                {/* Ukuran 24px, strokeWidth 2 */}
                <Icon
                  className="w-6 h-6 transition-transform duration-150"
                  strokeWidth={2}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#E53935] text-white text-[10px] font-bold shadow-xs animate-in zoom-in-50 duration-150">
                    {item.badge}
                  </span>
                )}
              </div>
              {/* Label teks 11px di bawah ikon */}
              <span
                className={`text-[11px] leading-tight tracking-tight transition-colors duration-150 ${
                  isActive
                    ? "font-semibold text-[#146C43]"
                    : "font-normal text-[#6B7280]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
