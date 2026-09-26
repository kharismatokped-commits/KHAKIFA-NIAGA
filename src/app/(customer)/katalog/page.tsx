"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductListSkeleton } from "@/components/product/ProductCardSkeleton";
import { Product } from "@/types/product";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search,
  Sparkles,
  X,
  LayoutGrid,
  BookOpen,
  Package,
  Home,
  Zap,
  Gamepad2,
  Trophy,
  Loader2,
  CheckCircle2,
  ChevronDown,
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
    return <BookOpen className="w-4 h-4 shrink-0" strokeWidth={2.2} />;
  }
  if (code === "RT" || name.includes("rumah") || name.includes("tangga")) {
    return <Home className="w-4 h-4 shrink-0" strokeWidth={2.2} />;
  }
  if (code === "PLASTIK" || name.includes("plastik") || name.includes("kemasan")) {
    return <Package className="w-4 h-4 shrink-0" strokeWidth={2.2} />;
  }
  if (code === "LT" || name.includes("listrik") || name.includes("perkakas")) {
    return <Zap className="w-4 h-4 shrink-0" strokeWidth={2.2} />;
  }
  if (code === "MNA" || name.includes("mainan")) {
    return <Gamepad2 className="w-4 h-4 shrink-0" strokeWidth={2.2} />;
  }
  if (code === "OLR" || name.includes("olahraga")) {
    return <Trophy className="w-4 h-4 shrink-0" strokeWidth={2.2} />;
  }
  return <LayoutGrid className="w-4 h-4 shrink-0" strokeWidth={2.2} />;
}

const PAGE_SIZE = 20;

function KatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("kategori");
  const initialQuery = searchParams.get("q") || "";
  const initialPromo = searchParams.get("promo") === "true";

  // Multi-select category chips: array of category IDs
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    return initialCategory && initialCategory !== "all"
      ? [initialCategory]
      : [];
  });

  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [onlyPromo, setOnlyPromo] = useState<boolean>(initialPromo);
  const [sortBy, setSortBy] = useState<
    "popular" | "price-asc" | "price-desc" | "name"
  >("popular");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);

  // Debounced search query (300ms)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Update jika query string URL berubah
  useEffect(() => {
    const qFromUrl = searchParams.get("q");
    if (qFromUrl !== null) {
      setSearchQuery((prev) => (prev !== qFromUrl ? qFromUrl : prev));
    }
    const catFromUrl = searchParams.get("kategori");
    if (catFromUrl !== null && catFromUrl !== "all") {
      setSelectedCategories([catFromUrl]);
    }
  }, [searchParams]);

  // Fetch daftar kategori toko sekali saat mount
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const sorted = [...res.data].sort((a, b) => {
            const countA = a._count?.products ?? 0;
            const countB = b._count?.products ?? 0;
            return countB - countA;
          });
          setCategories(sorted);
        }
      })
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  // Fetch produk halaman 1 saat filter atau query berubah
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setPage(1);

    const params = new URLSearchParams();
    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","));
    }

    const trimmedQuery = debouncedSearchQuery.trim();
    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    }

    params.set("limit", String(PAGE_SIZE));
    params.set("page", "1");

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        if (!isCancelled) {
          const fetched: Product[] = res.customerProducts || [];
          setProducts(fetched);
          const total = res.meta?.total ?? fetched.length;
          setTotalProducts(total);
          setHasMore(fetched.length < total);
        }
      })
      .catch((err) => {
        if (!isCancelled) console.error("Error loading products:", err);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearchQuery, selectedCategories]);

  // Handle Load More (Muat 20 produk berikutnya)
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const nextPage = page + 1;
    const params = new URLSearchParams();
    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","));
    }

    const trimmedQuery = debouncedSearchQuery.trim();
    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    }

    params.set("limit", String(PAGE_SIZE));
    params.set("page", String(nextPage));

    try {
      const res = await fetch(`/api/products?${params.toString()}`).then((r) =>
        r.json()
      );
      const newItems: Product[] = res.customerProducts || [];
      const updatedList = [...products, ...newItems];
      setProducts(updatedList);
      setPage(nextPage);
      const total = res.meta?.total ?? totalProducts;
      setTotalProducts(total);
      setHasMore(updatedList.length < total);
    } catch (err) {
      console.error("Error loading more products:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Toggle multi-select category chip
  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(catId)) {
        return prev.filter((id) => id !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  const selectAllCategories = () => {
    setSelectedCategories([]);
  };

  // Client-side filtering & sorting tambahan
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter promo jika checkbox diaktifkan
    if (onlyPromo) {
      result = result.filter((p) => p.isPromo);
    }

    // Jika dalam mode pencarian dengan sortBy === 'popular',
    // pertahankan urutan relevansi skor dari pg_trgm backend
    if (debouncedSearchQuery.trim() && sortBy === "popular") {
      return result;
    }

    return [...result].sort((a, b) => {
      const priceA =
        a.tieredPricesPcs[a.tieredPricesPcs.length - 1]?.price || 0;
      const priceB =
        b.tieredPricesPcs[b.tieredPricesPcs.length - 1]?.price || 0;

      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    });
  }, [products, debouncedSearchQuery, onlyPromo, sortBy]);

  const resetFilters = () => {
    setSelectedCategories([]);
    setSearchQuery("");
    setOnlyPromo(false);
    setSortBy("popular");
  };

  const isAllSelected = selectedCategories.length === 0;

  return (
    <div className="space-y-5 pb-16">
      {/* Title & Search bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Katalog Produk Grosir
          </h2>
          <p className="text-xs text-gray-500">
            Kulakan barang dagangan toko dengan harga grosir bertingkat transparan
          </p>
        </div>

        {/* Search input with Debounce & Clear */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari produk (misal: lem, pulpen, kertas)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <div className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none">
            {isLoading && searchQuery.trim() ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
              title="Bersihkan pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Informasi Hasil Pencarian Cerdas Aktif */}
        {debouncedSearchQuery.trim() && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-gray-700">
                Menampilkan hasil pencarian untuk{" "}
                <span className="font-bold text-gray-900">
                  &ldquo;{debouncedSearchQuery.trim()}&rdquo;
                </span>{" "}
                (toleran typo & sinonim aktif)
              </span>
            </div>
            <span className="text-primary font-bold">
              {totalProducts} produk ditemukan
            </span>
          </div>
        )}

        {/* Multi-Select Category Filter Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              Filter Kategori:
            </span>
            {selectedCategories.length > 0 && (
              <button
                type="button"
                onClick={selectAllCategories}
                className="text-[11px] text-primary font-semibold hover:underline cursor-pointer"
              >
                Pilih Semua ({categories.length})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[12px] sm:text-[13px]">
            {/* Chip Semua Kategori */}
            <button
              type="button"
              onClick={selectAllCategories}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                isAllSelected
                  ? "bg-primary text-white shadow-xs font-bold"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" strokeWidth={2.2} />
              <span>Semua Kategori</span>
            </button>

            {/* Chips Kategori (Multi-select) */}
            {categories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isSelected
                      ? "bg-primary text-white shadow-xs font-bold"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span>{cat.nama}</span>
                  {cat._count?.products ? (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                        isSelected
                          ? "bg-white/25 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {cat._count.products}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bar Filter Cepat: Promo & Urutan */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyPromo}
              onChange={(e) => setOnlyPromo(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
            />
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Hanya Promo Grosir</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary min-h-[38px] cursor-pointer"
            >
              <option value="popular">
                {debouncedSearchQuery.trim()
                  ? "Paling Relevan (Skor Terbaik)"
                  : "Paling Populer"}
              </option>
              <option value="price-asc">Harga Grosir: Termurah</option>
              <option value="price-desc">Harga Grosir: Tertinggi</option>
              <option value="name">Nama: A - Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ringkasan Jumlah Produk */}
      <div className="flex items-center justify-between px-1 text-xs text-gray-500 font-medium">
        <span>
          Menampilkan <strong className="text-gray-900">{filteredProducts.length}</strong> dari{" "}
          <strong className="text-gray-900">{totalProducts}</strong> produk
        </span>
        {selectedCategories.length > 0 && (
          <span className="text-primary font-semibold">
            {selectedCategories.length} kategori aktif
          </span>
        )}
      </div>

      {/* Product List: Grid 2 Kolom Kompak */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-2.5 sm:p-3 animate-pulse space-y-2"
            >
              <div className="aspect-[4/3] bg-gray-100 rounded-xl" />
              <div className="h-2.5 bg-gray-100 rounded w-1/3" />
              <div className="h-3.5 bg-gray-100 rounded w-4/5" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-9 bg-gray-100 rounded-xl mt-2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="grid"
                highlightQuery={debouncedSearchQuery.trim()}
              />
            ))}
          </div>

          {/* Tombol Muat Lebih Banyak (Paginasi 20 per Halaman) */}
          {hasMore && (
            <div className="pt-4 pb-2 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white border border-gray-200 hover:border-primary hover:bg-emerald-50/50 text-gray-800 hover:text-primary font-heading font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer disabled:opacity-60"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>Memuat 20 produk berikutnya...</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 text-primary" />
                    <span>
                      Muat 20 Produk Lainnya (Sisa {Math.max(0, totalProducts - filteredProducts.length)})
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {!hasMore && filteredProducts.length > 0 && totalProducts > PAGE_SIZE && (
            <div className="text-center py-4 text-xs text-gray-400 font-medium">
              Semua {totalProducts} produk telah ditampilkan
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-base text-gray-800">
            Tidak ada produk yang sesuai
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau pilih kategori lain untuk
            menemukan barang dagangan yang Anda cari.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-emerald-50 text-primary font-bold text-xs rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      )}
    </div>
  );
}

export default function KatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-gray-500">
          Memuat katalog...
        </div>
      }
    >
      <KatalogContent />
    </Suspense>
  );
}
