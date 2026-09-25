"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Menu, X, Store, Grid, Home, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { normalizeWhatsAppNumber } from "@/lib/formatters";
import { useStoreSettings } from "@/hooks/useStoreSettings";

export const Header: React.FC = () => {
  const router = useRouter();
  const { totalItemsCount } = useCart();
  const storeSettings = useStoreSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Jika dekat dengan posisi paling atas, selalu tampilkan header lengkap
      if (currentScrollY <= 20) {
        setIsHeaderCollapsed(false);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Deteksi arah scroll dengan threshold 8px agar responsif & tidak glitch
      if (currentScrollY > 50) {
        if (currentScrollY > lastScrollY.current + 8) {
          // Scroll KE BAWAH -> sembunyikan lapis atas (logo KN & nama toko)
          setIsHeaderCollapsed(true);
        } else if (currentScrollY < lastScrollY.current - 8) {
          // Scroll KE ATAS -> munculkan kembali lapis atas
          setIsHeaderCollapsed(false);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/katalog?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/katalog");
    }
  };

  const waUrl = `https://wa.me/${normalizeWhatsAppNumber(storeSettings.nomorWhatsApp)}?text=${encodeURIComponent(`Halo admin ${storeSettings.namaToko}, saya ingin tanya info grosir.`)}`;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 pt-2.5 pb-2.5">
          {/* LAPIS ATAS: Logo KN + Nama Toko + Keranjang + Menu Hamburger (Collapse saat scroll ke bawah) */}
          <div
            className={`overflow-hidden transition-all duration-250 ease-out ${
              isHeaderCollapsed
                ? "max-h-0 opacity-0 -translate-y-2 pointer-events-none mb-0"
                : "max-h-16 opacity-100 translate-y-0 mb-2.5"
            }`}
            style={{
              transition: "max-height 0.25s ease-out, opacity 0.25s ease-out, transform 0.25s ease-out, margin 0.25s ease-out",
            }}
          >
            <div className="flex items-center justify-between gap-3 pb-1">
              {/* Sisi Kiri: Logo KN & Identitas Toko */}
              <Link href="/" className="flex items-center gap-3 group shrink-0">
                {/* Logo Kotak Squircle Gradient Hijau-Zaitun */}
                <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-[#207a4a] via-[#359055] to-[#8c9c34] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <span className="font-heading font-black text-white text-xl tracking-wider select-none">
                    KN
                  </span>
                </div>

                {/* Teks Nama & Subtitle */}
                <div className="flex flex-col justify-center">
                  <h1 className="font-heading font-black text-[18px] sm:text-[20px] text-[#0f172a] tracking-tight leading-none">
                    {storeSettings.namaToko}
                  </h1>
                  <p className="text-[11px] sm:text-xs text-[#64748b] font-medium tracking-tight mt-1">
                    Grosir Alat Tulis • Aksesoris • Kelontong
                  </p>
                </div>
              </Link>

              {/* Sisi Kanan: Trolley Keranjang (Badge Merah) + Tombol Hamburger */}
              <div className="flex items-center gap-3">
                {/* Ikon Keranjang Trolley dengan Badge Angka Merah */}
                <Link
                  href="/keranjang"
                  className="relative p-1 text-gray-700 hover:text-gray-900 transition-colors"
                  aria-label="Keranjang Belanja"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 stroke-[2.2] text-gray-600" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-[#E53935] text-white text-[11px] font-black shadow-xs">
                    {totalItemsCount}
                  </span>
                </Link>

                {/* Hamburger Menu 3 Garis */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1.5 rounded-lg text-gray-800 hover:bg-gray-100 transition-colors"
                  aria-label="Menu Navigasi"
                >
                  <Menu className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          {/* LAPIS BAWAH: Search Input Oval Abu-abu (Pill) - Tetap Sticky di Posisi Paling Atas */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Cari produk, nama, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-9 rounded-2xl bg-[#EEF2F6] text-gray-800 placeholder:text-[#94A3B8] text-[13px] sm:text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-[#146C43] transition-all"
            />
            {/* Search Icon */}
            <div className="absolute left-3.5 top-3 text-[#94A3B8] pointer-events-none">
              <Search className="w-4 h-4 stroke-[2.2]" />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-4 h-4" strokeWidth={2.2} />
              </button>
            )}
          </form>
        </div>
      </header>

      {/* Slide-over Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-72 bg-white h-full shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#207a4a] to-[#8c9c34] flex items-center justify-center text-white font-black text-sm">
                    KN
                  </div>
                  <span className="font-heading font-black text-sm text-gray-900">
                    Menu Grosir
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" strokeWidth={2.2} />
                </button>
              </div>

              <nav className="mt-4 space-y-1.5 text-sm font-bold text-gray-700">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-[#146C43] transition-colors"
                >
                  <Home className="w-5 h-5 text-[#146C43]" strokeWidth={2.2} />
                  <span>Beranda</span>
                </Link>

                <Link
                  href="/katalog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-[#146C43] transition-colors"
                >
                  <Grid className="w-5 h-5 text-[#146C43]" strokeWidth={2.2} />
                  <span>Katalog Produk</span>
                </Link>

                <Link
                  href="/keranjang"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-[#146C43] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5 text-[#146C43]" strokeWidth={2.2} />
                    <span>Keranjang Belanja</span>
                  </div>
                  {totalItemsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#E53935] text-white text-xs font-black">
                      {totalItemsCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/info-toko"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-[#146C43] transition-colors"
                >
                  <Store className="w-5 h-5 text-[#146C43]" strokeWidth={2.2} />
                  <span>Info Toko & Kontak</span>
                </Link>
              </nav>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#146C43] text-white rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-5 h-5" strokeWidth={2.2} />
                <span>Chat Admin WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
