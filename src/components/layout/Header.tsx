"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Store,
  Grid,
  Home,
  MessageCircle,
  Loader2,
  ChevronRight,
  Package,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { normalizeWhatsAppNumber, formatRupiah } from "@/lib/formatters";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useDebounce } from "@/hooks/useDebounce";
import { HighlightText } from "@/components/common/HighlightText";
import { getPlaceholderByCategory } from "@/lib/placeholders";

export const Header: React.FC = () => {
  const router = useRouter();
  const { totalItemsCount } = useCart();
  const storeSettings = useStoreSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const lastScrollY = useRef(0);

  // Debounced search for live autocomplete dropdown
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [dropdownResults, setDropdownResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  // Fetch smart live search dropdown (debounced 300ms)
  useEffect(() => {
    const query = debouncedSearchQuery.trim();
    if (query.length < 2) {
      setDropdownResults([]);
      setIsSearching(false);
      return;
    }

    let isCancelled = false;
    setIsSearching(true);

    fetch(`/api/products?q=${encodeURIComponent(query)}&limit=6`)
      .then((res) => res.json())
      .then((res) => {
        if (!isCancelled) {
          if (res.customerProducts) {
            setDropdownResults(res.customerProducts);
            setShowDropdown(true);
          } else {
            setDropdownResults([]);
          }
        }
      })
      .catch((err) => {
        if (!isCancelled) console.error("Autocomplete search error:", err);
      })
      .finally(() => {
        if (!isCancelled) setIsSearching(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearchQuery]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (searchQuery.trim()) {
      router.push(`/katalog?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/katalog");
    }
  };

  const handleSelectProduct = (productId: string) => {
    setShowDropdown(false);
    router.push(`/produk/${productId}`);
  };

  const phone =
    normalizeWhatsAppNumber(storeSettings.nomorWhatsApp || "6287789923079") ||
    "6287789923079";
  const defaultMessage =
    process.env.NEXT_PUBLIC_WA_MESSAGE ||
    "Halo, saya tertarik belanja di Khalifa Niaga";
  const waLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(defaultMessage)}`;

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
              transition:
                "max-height 0.25s ease-out, opacity 0.25s ease-out, transform 0.25s ease-out, margin 0.25s ease-out",
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

              {/* Sisi Kanan: WhatsApp (Desktop) + Trolley Keranjang (Badge Merah) + Tombol Hamburger */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Tombol WhatsApp Desktop */}
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  aria-label="Chat WhatsApp Admin"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-white" />
                  <span>WhatsApp</span>
                </a>

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

          {/* LAPIS BAWAH: Search Input Oval Abu-abu (Pill) dengan Live Dropdown */}
          <div ref={dropdownRef} className="relative w-full">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Cari produk (contoh: pulpn, lem, atk, kertas)..."
                value={searchQuery}
                onFocus={() => {
                  if (dropdownResults.length > 0) setShowDropdown(true);
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!showDropdown && e.target.value.trim().length >= 2) {
                    setShowDropdown(true);
                  }
                }}
                className="w-full h-11 pl-10 pr-10 rounded-2xl bg-[#EEF2F6] text-gray-800 placeholder:text-[#94A3B8] text-[13px] sm:text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              {/* Search Icon / Loader */}
              <div className="absolute left-3.5 top-3 text-[#94A3B8] pointer-events-none">
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <Search className="w-4 h-4 stroke-[2.2]" />
                )}
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setDropdownResults([]);
                    setShowDropdown(false);
                  }}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-4 h-4" strokeWidth={2.2} />
                </button>
              )}
            </form>

            {/* Floating Live Autocomplete Dropdown */}
            {showDropdown && debouncedSearchQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-gray-50 flex items-center justify-between text-[11px] text-gray-400 font-semibold px-3">
                  <span>Hasil Cepat untuk &ldquo;{debouncedSearchQuery}&rdquo;</span>
                  {dropdownResults.length > 0 && (
                    <span className="text-primary font-bold">
                      {dropdownResults.length} barang ditemukan
                    </span>
                  )}
                </div>

                {isSearching ? (
                  <div className="p-6 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>Mencari di database produk...</span>
                  </div>
                ) : dropdownResults.length > 0 ? (
                  <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                    {dropdownResults.map((item) => {
                      const lowestPrice =
                        item.tieredPricesPcs?.length > 0
                          ? item.tieredPricesPcs[item.tieredPricesPcs.length - 1]
                              .price
                          : 0;
                      const imageSrc =
                        item.images?.[0] ||
                        getPlaceholderByCategory(item.categoryCode || item.category);
                      const isPlaceholder = imageSrc.startsWith("/placeholders/");

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectProduct(item.id)}
                          className="p-3 hover:bg-gray-50 flex items-center gap-3 cursor-pointer transition-colors"
                        >
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center">
                            <Image
                              src={imageSrc}
                              alt={item.name}
                              fill
                              sizes="44px"
                              className={
                                isPlaceholder
                                  ? "object-contain p-1 bg-[#F9FBFA]"
                                  : "object-cover"
                              }
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-900 line-clamp-1">
                              <HighlightText
                                text={item.name}
                                query={debouncedSearchQuery}
                              />
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-bold text-primary">
                                {formatRupiah(lowestPrice)}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                /{item.unitPcsName || "pcs"}
                              </span>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="w-full p-2.5 bg-emerald-50/70 hover:bg-emerald-100/70 text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>
                        Lihat semua hasil di katalog ({searchQuery})
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-gray-500">
                    <p className="font-semibold text-gray-700">
                      Tidak menemukan produk &ldquo;{debouncedSearchQuery}&rdquo;
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Coba gunakan istilah lain atau periksa kembali ejaan Anda.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-primary transition-colors"
                >
                  <Home className="w-5 h-5 text-primary" strokeWidth={2.2} />
                  <span>Beranda</span>
                </Link>

                <Link
                  href="/katalog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-primary transition-colors"
                >
                  <Grid className="w-5 h-5 text-primary" strokeWidth={2.2} />
                  <span>Katalog Produk</span>
                </Link>

                <Link
                  href="/keranjang"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart
                      className="w-5 h-5 text-primary"
                      strokeWidth={2.2}
                    />
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-primary transition-colors"
                >
                  <Store className="w-5 h-5 text-primary" strokeWidth={2.2} />
                  <span>Info Toko & Kontak</span>
                </Link>
              </nav>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
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
