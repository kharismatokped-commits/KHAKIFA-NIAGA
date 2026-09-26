"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
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
  Store,
  Grid,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface CategoryData {
  id: string;
  nama: string;
  ikon: string;
}

function getCategoryIcon(id: string) {
  switch (id) {
    case "atk":
      return <BookOpen className="w-4 h-4" strokeWidth={2.2} />;
    case "plastik-kemasan":
      return <Package className="w-4 h-4" strokeWidth={2.2} />;
    case "rumah-tangga":
      return <Home className="w-4 h-4" strokeWidth={2.2} />;
    case "kelontong":
      return <Store className="w-4 h-4" strokeWidth={2.2} />;
    default:
      return <Grid className="w-4 h-4" strokeWidth={2.2} />;
  }
}

function KatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("kategori") || "all";
  const initialQuery = searchParams.get("q") || "";
  const initialPromo = searchParams.get("promo") === "true";

  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [onlyPromo, setOnlyPromo] = useState<boolean>(initialPromo);
  const [sortBy, setSortBy] = useState<
    "popular" | "price-asc" | "price-desc" | "name"
  >("popular");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Debounced search query (±300ms)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Update searchQuery jika parameter URL q berubah
  useEffect(() => {
    const qFromUrl = searchParams.get("q");
    if (qFromUrl !== null) {
      setSearchQuery((prev) => (prev !== qFromUrl ? qFromUrl : prev));
    }
    const catFromUrl = searchParams.get("kategori");
    if (catFromUrl !== null) {
      setSelectedCategory((prev) => (prev !== catFromUrl ? catFromUrl : prev));
    }
  }, [searchParams]);

  // Fetch daftar kategori toko sekali saat mount
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setCategories(res.data);
        }
      })
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  // Fetch produk dari backend API dengan debounced search & smart pg_trgm ranking
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    const trimmedQuery = debouncedSearchQuery.trim();
    if (trimmedQuery) {
      params.set("q", trimmedQuery);
      params.set("limit", "20"); // Maksimal 20 hasil pencarian teratas
    } else {
      params.set("limit", "100");
    }

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        if (!isCancelled) {
          if (res.customerProducts) {
            setProducts(res.customerProducts);
          } else {
            setProducts([]);
          }
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
  }, [debouncedSearchQuery, selectedCategory]);

  // Client-side filtering & sorting tambahan
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter promo jika checkbox diaktifkan
    if (onlyPromo) {
      result = result.filter((p) => p.isPromo);
    }

    // Jika sedang dalam mode pencarian dengan sortBy === 'popular',
    // pertahankan urutan relevansi skor (score DESC) langsung dari pg_trgm backend
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
    setSelectedCategory("all");
    setSearchQuery("");
    setOnlyPromo(false);
    setSortBy("popular");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Search bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
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
            placeholder="Cari nama barang, jenis ATK, lakban, plastik, kresek, dll..."
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
                Menampilkan hasil untuk kata kunci{" "}
                <span className="font-bold text-gray-900">
                  &ldquo;{debouncedSearchQuery.trim()}&rdquo;
                </span>{" "}
                (toleran typo & sinonim aktif)
              </span>
            </div>
            <span className="text-primary font-bold">
              {filteredProducts.length} produk ditemukan
            </span>
          </div>
        )}

        {/* Filter Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[12px] sm:text-[13px]">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors shrink-0 flex items-center gap-2 cursor-pointer ${
              selectedCategory === "all"
                ? "bg-primary text-white shadow-xs"
                : "bg-white border border-gray-200 text-[#64748B] hover:bg-gray-50"
            }`}
          >
            <LayoutGrid className="w-4 h-4" strokeWidth={2.2} />
            <span>Semua Kategori</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors shrink-0 flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white shadow-xs"
                    : "bg-white border border-gray-200 text-[#64748B] hover:bg-gray-50"
                }`}
              >
                {getCategoryIcon(cat.id)}
                <span>{cat.nama}</span>
              </button>
            );
          })}
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

      {/* Product List: 1 Kolom List Vertikal */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          <p className="text-xs text-gray-500 font-medium">
            Mencari katalog produk di database...
          </p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="flex flex-col space-y-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              highlightQuery={debouncedSearchQuery.trim()}
            />
          ))}
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
