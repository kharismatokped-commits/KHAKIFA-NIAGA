"use client";

import React, { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useDebounce } from "@/hooks/useDebounce";
import {
  ShoppingCart,
  Search,
  MessageCircle,
  Loader2,
  PenLine,
  Home,
  Package,
  Store,
  Zap,
  Gamepad2,
  Trophy,
  Grid2x2,
  LayoutGrid,
  ArrowLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─────────────────────────────────────────────
// Tipe data
// ─────────────────────────────────────────────
interface CategoryItem {
  id: string;
  nama: string;
  kodeAsal?: string | null;
  ikon?: string;
  _count?: { products: number };
}

// ─────────────────────────────────────────────
// Mapping ikon per kode kategori
// ─────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  ATK: PenLine,
  RT: Home,
  plastik: Package,
  kelontong: Store,
  LT: Zap,
  MNA: Gamepad2,
  OLR: Trophy,
  AKS: Grid2x2,
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

const ICON_COLOR_MAP: Record<string, string> = {
  ATK: "#146C43",
  RT: "#146C43",
  plastik: "#146C43",
  kelontong: "#146C43",
  LT: "#D97706",
  MNA: "#DC2626",
  OLR: "#2563EB",
  AKS: "#7C3AED",
};

function getCategoryIcon(cat: CategoryItem): LucideIcon {
  const code = cat.kodeAsal || "";
  return ICON_MAP[code] || Grid2x2;
}

function getCategoryBg(cat: CategoryItem): string {
  const code = cat.kodeAsal || "";
  return BG_MAP[code] || "#EAF3DE";
}

function getCategoryIconColor(cat: CategoryItem): string {
  const code = cat.kodeAsal || "";
  return ICON_COLOR_MAP[code] || "#146C43";
}

// ─────────────────────────────────────────────
// Grid Tile Kategori
// ─────────────────────────────────────────────
interface CategoryTileProps {
  cat: CategoryItem;
  onClick: () => void;
}

const CategoryTile: React.FC<CategoryTileProps> = ({ cat, onClick }) => {
  const IconComponent = getCategoryIcon(cat);
  const bgColor = getCategoryBg(cat);
  const iconColor = getCategoryIconColor(cat);
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
    >
      {/* Lingkaran ikon */}
      <div
        className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
        style={{ backgroundColor: bgColor }}
      >
        <IconComponent
          className="w-7 h-7 sm:w-8 sm:h-8 transition-transform"
          style={{ color: iconColor }}
          strokeWidth={2}
        />
      </div>
      {/* Label */}
      <span className="font-sans text-[12px] sm:text-[13px] text-[#1A1A1A] text-center leading-tight max-w-[80px] line-clamp-2">
        {cat.nama}
      </span>
    </button>
  );
};

// ─────────────────────────────────────────────
// Tile "Semua Kategori"
// ─────────────────────────────────────────────
const SemualKategoriTile: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
  >
    <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center shadow-sm bg-[#F5F7F6] border border-[#E5E7EB] group-hover:scale-105 transition-transform">
      <LayoutGrid
        className="w-7 h-7 sm:w-8 sm:h-8 text-[#146C43] transition-transform"
        strokeWidth={2}
      />
    </div>
    <span className="font-sans font-semibold text-[12px] sm:text-[13px] text-[#146C43] text-center leading-tight max-w-[80px]">
      Semua Kategori
    </span>
  </button>
);

// ─────────────────────────────────────────────
// Konten utama halaman
// ─────────────────────────────────────────────
function KatalogPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("kategori") || "";
  const initialQuery = searchParams.get("q") || "";

  const { totalItemsCount, openCartDrawer } = useCart();
  const storeSettings = useStoreSettings();

  // "view" = "grid" (tampilkan grid kategori) | "products" (tampilkan list produk)
  const [view, setView] = useState<"grid" | "products">(
    initialCategory ? "products" : "grid"
  );
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [activeCategoryName, setActiveCategoryName] = useState<string>("");
  const [query, setQuery] = useState<string>(initialQuery);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true);

  const debouncedQuery = useDebounce(query, 300);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Link WhatsApp Toko
  const waNumber = (storeSettings?.nomorWhatsApp || "6287789923079").replace(/\D/g, "");
  const waLink = `https://wa.me/${waNumber}?text=Halo%20Admin%20Khalifa%20Niaga,%20saya%20ingin%20tanya%20tentang%20produk%20grosir`;

  // ── Fetch daftar kategori (satu kali) ──────────────────────
  useEffect(() => {
    setIsCategoriesLoading(true);
    fetch("/api/categories")
      .then((res) => res.json())
      .then((res) => {
        if (res.data && res.data.length > 0) {
          // Filter kategori yang punya produk, urutkan dari terbanyak
          const filtered = res.data
            .filter((c: CategoryItem) => (c._count?.products ?? 0) > 0)
            .sort((a: CategoryItem, b: CategoryItem) => {
              const countA = a._count?.products ?? 0;
              const countB = b._count?.products ?? 0;
              return countB - countA;
            });
          setCategories(filtered);
          // Set nama kategori aktif jika ada initialCategory
          if (initialCategory) {
            const found = filtered.find((c: CategoryItem) => c.id === initialCategory);
            if (found) setActiveCategoryName(found.nama);
          }
        }
      })
      .catch((err) => console.error("Error loading categories:", err))
      .finally(() => setIsCategoriesLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch produk page 1 ────────────────────────────────────
  useEffect(() => {
    if (view !== "products") return;
    let isMounted = true;
    setIsLoading(true);
    setPage(1);
    setProducts([]);

    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (debouncedQuery.trim() !== "") params.set("q", debouncedQuery.trim());
    params.set("page", "1");
    params.set("limit", "15");

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        if (!isMounted) return;
        const loaded: Product[] = res.customerProducts || [];
        setProducts(loaded);
        const total = res.meta?.total || 0;
        setHasMore(loaded.length < total);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error loading products:", err);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCategory, debouncedQuery, view]);

  // ── Load more ─────────────────────────────────────────────
  const loadMore = () => {
    if (isLoadingMore || !hasMore || isLoading) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (debouncedQuery.trim() !== "") params.set("q", debouncedQuery.trim());
    params.set("page", nextPage.toString());
    params.set("limit", "15");

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        const moreProducts: Product[] = res.customerProducts || [];
        if (moreProducts.length > 0) {
          setProducts((prev) => [...prev, ...moreProducts]);
          setPage(nextPage);
          const total = res.meta?.total || 0;
          setHasMore(products.length + moreProducts.length < total);
        } else {
          setHasMore(false);
        }
        setIsLoadingMore(false);
      })
      .catch(() => setIsLoadingMore(false));
  };

  // ── IntersectionObserver ──────────────────────────────────
  useEffect(() => {
    if (view !== "products") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );
    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, isLoading, isLoadingMore, page, view]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handler klik kategori ─────────────────────────────────
  const handleCategoryClick = (cat: CategoryItem) => {
    setActiveCategory(cat.id);
    setActiveCategoryName(cat.nama);
    setQuery("");
    setView("products");
  };

  const handleSemua = () => {
    setActiveCategory("");
    setActiveCategoryName("Semua Produk");
    setQuery("");
    setView("products");
  };

  const handleBack = () => {
    setView("grid");
    setQuery("");
    setActiveCategory("");
    setActiveCategoryName("");
  };

  // ── Judul di header ────────────────────────────────────────
  const headerTitle = view === "grid" ? "Kategori" : activeCategoryName || "Semua Produk";

  return (
    <main className="min-h-screen bg-[#F5F7F6] pb-24">
      {/* ── Header Hijau ── */}
      <header className="bg-[#146C43] px-4 pt-4 pb-4 sticky top-0 z-20">
        {/* Baris atas: logo + judul + keranjang */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {view === "products" && (
              <button
                type="button"
                onClick={handleBack}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-1 active:scale-95 transition-transform"
                aria-label="Kembali ke Kategori"
              >
                <ArrowLeft className="w-4 h-4 text-white" strokeWidth={2} />
              </button>
            )}
            <img
              src="/logo.png"
              className="w-8 h-8 rounded-lg bg-white p-0.5 object-contain"
              alt="Khalifa Niaga"
            />
            <span className="font-heading font-semibold text-[16px] text-white tracking-tight">
              {headerTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={openCartDrawer}
            className="relative cursor-pointer p-1"
            aria-label="Buka Keranjang"
          >
            <ShoppingCart className="w-6 h-6 text-white" strokeWidth={2} />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#E53935] text-white font-sans text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItemsCount}
              </span>
            )}
          </button>
        </div>

        {/* Search bar — rounded-full */}
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-sm">
          <Search className="w-4 h-4 text-[#6B7280] flex-shrink-0" strokeWidth={2} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim() && view === "grid") {
                // Auto-pindah ke view produk jika ada query
                setActiveCategory("");
                setActiveCategoryName("Hasil Pencarian");
                setView("products");
              }
            }}
            placeholder={
              view === "grid"
                ? "Cari produk atau kategori..."
                : `Cari di ${activeCategoryName || "semua produk"}...`
            }
            className="flex-1 font-sans text-[13px] outline-none bg-transparent text-[#1A1A1A] placeholder:text-[#6B7280]"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors text-xs font-sans"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* ── View: Grid Kategori ── */}
      {view === "grid" && (
        <section className="px-4 py-5">
          <h2 className="font-heading font-semibold text-[15px] text-[#1A1A1A] mb-4">
            Pilih Kategori
          </h2>

          {isCategoriesLoading ? (
            /* Skeleton 3-kolom */
            <div className="grid grid-cols-3 gap-x-4 gap-y-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
                  <div className="w-14 h-3 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-x-4 gap-y-6">
              {/* Tile Semua Kategori selalu pertama */}
              <SemualKategoriTile onClick={handleSemua} />

              {/* Tile tiap kategori */}
              {categories.map((cat) => (
                <CategoryTile
                  key={cat.id}
                  cat={cat}
                  onClick={() => handleCategoryClick(cat)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── View: List Produk ── */}
      {view === "products" && (
        <div className="px-4 pt-3 max-w-4xl mx-auto">
          {/* Sub-judul + jumlah produk */}
          {!isLoading && products.length > 0 && (
            <p className="font-sans text-[12px] text-[#6B7280] mb-3">
              {activeCategory
                ? `${products.length} produk di kategori ini`
                : `${products.length} produk ditampilkan`}
            </p>
          )}

          {isLoading ? (
            <div className="py-16 text-center text-gray-500 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#146C43]" />
              <p className="text-xs font-sans">Memuat produk...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-[#E5E7EB] my-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#F5F7F6] flex items-center justify-center mx-auto">
                <LayoutGrid className="w-7 h-7 text-[#146C43]" strokeWidth={2} />
              </div>
              <p className="font-heading font-semibold text-[14px] text-[#1A1A1A]">
                Tidak ada produk ditemukan
              </p>
              <p className="font-sans text-[12px] text-[#6B7280]">
                Coba ganti kata kunci atau{" "}
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-[#146C43] font-medium underline"
                >
                  lihat kategori lain
                </button>
              </p>
            </div>
          ) : (
            products.map((p) => <ProductCard key={p.id} product={p} />)
          )}

          {isLoadingMore && (
            <div className="py-4 text-center">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#146C43]" />
            </div>
          )}

          <div ref={loadMoreRef} className="h-10" />
        </div>
      )}

      {/* ── Tombol WhatsApp mengambang ── */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg z-30 hover:scale-105 active:scale-95 transition-transform"
        aria-label="Hubungi WhatsApp"
      >
        <MessageCircle className="w-6 h-6 text-white fill-white" />
      </a>
    </main>
  );
}

export default function KatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F7F6] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#146C43]" />
        </div>
      }
    >
      <KatalogPageContent />
    </Suspense>
  );
}
