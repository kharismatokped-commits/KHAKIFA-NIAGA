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
    /* Wrapper transparan — hanya sebagai posisi anchor, tidak ada background/shadow */
    <nav
      className="sm:hidden fixed bottom-3.5 left-1/2 -translate-x-1/2 z-40"
      style={{
        width: "calc(100% - 36px)",
        maxWidth: "444px",
        height: "68px",
        background: "transparent",
        border: "none",
        boxShadow: "none",
        padding: 0,
      }}
    >
      {/* Pill itu sendiri — background putih + shadow hanya di sini */}
      <div
        className="flex items-center justify-around h-full px-2"
        style={{
          height: "68px",
          borderRadius: "26px",
          background: "#F8F9FE",
          boxShadow: "10px 10px 24px rgba(163,177,198,0.34), -8px -8px 20px rgba(255,255,255,0.80)",
        }}
      >
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
              className="relative flex-shrink-0 select-none active:scale-95 transition-all duration-200"
            >
              {isActive ? (
                /* Tab Aktif: pill gradien hijau */
                <span
                  className="flex flex-col items-center justify-center gap-0.5 px-4 py-2"
                  style={{
                    background: "linear-gradient(135deg, #2E9B63, #146C43)",
                    borderRadius: "20px",
                    boxShadow: "0 6px 18px rgba(20,108,67,0.32)",
                    minWidth: "72px",
                    minHeight: "52px",
                  }}
                >
                  <Icon className="w-[22px] h-[22px] text-white" strokeWidth={2} />
                  <span className="text-[9.5px] font-bold text-white leading-tight">{item.label}</span>
                </span>
              ) : (
                /* Tab Normal */
                <span className="flex flex-col items-center justify-center gap-0.5 px-3 py-2" style={{ minWidth: "62px", minHeight: "52px" }}>
                  <span className="relative">
                    <Icon className="w-[22px] h-[22px] text-[#8A8FA8]" strokeWidth={2} />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className="absolute -top-1.5 -right-2.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-white text-[9px] font-bold"
                        style={{
                          background: "linear-gradient(135deg, #FF6B6B, #E5484D)",
                          boxShadow: "0 3px 8px rgba(229,72,77,0.45)",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <span className="text-[9.5px] font-700 text-[#8A8FA8] leading-tight">{item.label}</span>
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
