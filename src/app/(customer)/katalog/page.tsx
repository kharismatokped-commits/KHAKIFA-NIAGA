"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useDebounce } from "@/hooks/useDebounce";
import { ShoppingCart, Search, MessageCircle, Loader2 } from "lucide-react";

interface CategoryItem {
  id: string;
  nama: string;
}

function KatalogPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("kategori") || "all";
  const initialQuery = searchParams.get("q") || "";

  const { totalItemsCount, openCartDrawer } = useCart();
  const storeSettings = useStoreSettings();

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [query, setQuery] = useState<string>(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: "all", nama: "Semua Produk" },
  ]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const debouncedQuery = useDebounce(query, 300);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Link WhatsApp Toko
  const waNumber = (storeSettings?.nomorWhatsApp || "6287789923079").replace(/\D/g, "");
  const waLink = `https://wa.me/${waNumber}?text=Halo%20Admin%20Khalifa%20Niaga,%20saya%20ingin%20tanya%20tentang%20produk%20grosir`;

  // Fetch daftar kategori
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const list: CategoryItem[] = [
            { id: "all", nama: "Semua Produk" },
            ...res.data.map((c: any) => ({
              id: c.id,
              nama: c.nama,
            })),
          ];
          setCategories(list);
        }
      })
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  // Fetch produk halaman 1 saat query atau kategori berganti
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setPage(1);

    const params = new URLSearchParams();
    if (activeCategory && activeCategory !== "all") {
      params.set("category", activeCategory);
    }
    if (debouncedQuery.trim() !== "") {
      params.set("q", debouncedQuery.trim());
    }
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
  }, [activeCategory, debouncedQuery]);

  // Load more function untuk infinite scroll
  const loadMore = () => {
    if (isLoadingMore || !hasMore || isLoading) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;
    const params = new URLSearchParams();
    if (activeCategory && activeCategory !== "all") {
      params.set("category", activeCategory);
    }
    if (debouncedQuery.trim() !== "") {
      params.set("q", debouncedQuery.trim());
    }
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
      .catch((err) => {
        console.error("Error loading more products:", err);
        setIsLoadingMore(false);
      });
  };

  // Setup IntersectionObserver pada loadMoreRef
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, page, activeCategory, debouncedQuery]);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header + search, sticky */}
      <header className="sticky top-0 z-20 bg-[#146C43] px-4 pt-3 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              className="w-8 h-8 rounded-md bg-white p-0.5 object-contain"
              alt="Khalifa Niaga"
            />
            <span className="text-white font-semibold text-base">
              Khalifa Niaga
            </span>
          </div>
          <button
            type="button"
            onClick={openCartDrawer}
            className="relative cursor-pointer p-1"
            aria-label="Buka Keranjang"
          >
            <ShoppingCart className="w-6 h-6 text-white" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItemsCount}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-xs">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari produk, nama, atau kategori..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
      </header>

      {/* Kategori filter, sticky di bawah header */}
      <div className="sticky top-[96px] sm:top-[88px] z-10 bg-gray-50 px-4 py-2 flex gap-2 overflow-x-auto border-b border-gray-200 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveCategory(c.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
              activeCategory === c.id
                ? "bg-[#146C43] text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {c.nama}
          </button>
        ))}
      </div>

      {/* List produk, infinite scroll */}
      <div className="px-4 pt-3 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="py-16 text-center text-gray-500 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#146C43]" />
            <p className="text-xs">Memuat katalog produk grosir...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 my-4 space-y-2">
            <p className="text-sm font-bold text-gray-700">
              Tidak ada produk yang cocok
            </p>
            <p className="text-xs text-gray-500">
              Coba ganti kata kunci pencarian atau pilih kategori yang lain.
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

        <div ref={loadMoreRef} className="h-10" /> {/* trigger IntersectionObserver */}
      </div>

      {/* Tombol WhatsApp mengambang */}
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#146C43]" />
        </div>
      }
    >
      <KatalogPageContent />
    </Suspense>
  );
}
