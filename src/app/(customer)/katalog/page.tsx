"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_PRODUCTS, CATEGORIES } from "@/data/mockProducts";
import { ProductCard } from "@/components/product/ProductCard";
import { CategoryId } from "@/types/product";
import { Search, Filter, Sparkles, X, LayoutGrid, BookOpen, Package, Home, Store, Grid } from "lucide-react";

function KatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("kategori") as CategoryId) || "all";
  const initialQuery = searchParams.get("q") || "";
  const initialPromo = searchParams.get("promo") === "true";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [onlyPromo, setOnlyPromo] = useState<boolean>(initialPromo);
  const [sortBy, setSortBy] = useState<"popular" | "price-asc" | "price-desc" | "name">("popular");
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  React.useEffect(() => {
    fetch("/api/products?limit=100")
      .then((r) => r.json())
      .then((data) => {
        if (data.customerProducts && data.customerProducts.length > 0) {
          setProducts(data.customerProducts);
        }
      })
      .catch((err) => console.warn("Using fallback products:", err));
  }, []);

  // Filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter kategori
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }

      // Filter promo
      if (onlyPromo && !product.isPromo) {
        return false;
      }

      // Filter search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(query);
        const matchSku = product.sku.toLowerCase().includes(query);
        const matchDesc = product.description.toLowerCase().includes(query);
        if (!matchName && !matchSku && !matchDesc) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.tieredPricesPcs[a.tieredPricesPcs.length - 1]?.price || 0;
      const priceB = b.tieredPricesPcs[b.tieredPricesPcs.length - 1]?.price || 0;

      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    });
  }, [selectedCategory, searchQuery, onlyPromo, sortBy]);

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

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari nama barang, jenis ATK, lakban, plastik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146C43] transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Categories Chips (12–13px) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[12px] sm:text-[13px]">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors shrink-0 flex items-center gap-2 ${
              selectedCategory === "all"
                ? "bg-[#146C43] text-white shadow-xs"
                : "bg-white border border-gray-200 text-[#64748B] hover:bg-gray-50"
            }`}
          >
            <LayoutGrid className="w-4 h-4" strokeWidth={2.2} />
            <span>Semua Produk ({products.length})</span>
          </button>

          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? "bg-[#146C43] text-white shadow-xs"
                    : "bg-white border border-gray-200 text-[#64748B] hover:bg-gray-50"
                }`}
              >
                {cat.id === "atk" && <BookOpen className="w-4 h-4" strokeWidth={2.2} />}
                {cat.id === "plastik-kemasan" && <Package className="w-4 h-4" strokeWidth={2.2} />}
                {cat.id === "rumah-tangga" && <Home className="w-4 h-4" strokeWidth={2.2} />}
                {cat.id === "kelontong" && <Store className="w-4 h-4" strokeWidth={2.2} />}
                {cat.id === "lainnya" && <Grid className="w-4 h-4" strokeWidth={2.2} />}
                <span>{cat.name}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setOnlyPromo(!onlyPromo)}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors shrink-0 flex items-center gap-2 ${
              onlyPromo
                ? "bg-[#F57C00] text-white shadow-xs"
                : "bg-white border border-amber-200 text-[#F57C00] hover:bg-amber-50"
            }`}
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.2} />
            <span>Promo Saja</span>
          </button>
        </div>

        {/* Secondary controls row: Count & Sort */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
          <div className="text-gray-600 font-medium">
            Menampilkan <strong>{filteredProducts.length}</strong> produk
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 hidden sm:inline">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#146C43] min-h-[38px]"
            >
              <option value="popular">Paling Populer</option>
              <option value="price-asc">Harga Grosir: Termurah</option>
              <option value="price-desc">Harga Grosir: Tertinggi</option>
              <option value="name">Nama: A - Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product List: 1 Kolom List Vertikal */}
      {filteredProducts.length > 0 ? (
        <div className="flex flex-col space-y-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">Tidak ada produk ditemukan</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Tidak ada produk yang cocok dengan kata kunci atau filter yang Anda pilih. Silakan coba kata kunci lain.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 bg-[#146C43] text-white rounded-lg text-xs font-bold hover:bg-[#115b38] transition-colors"
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
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Memuat katalog...</div>}>
      <KatalogContent />
    </Suspense>
  );
}
