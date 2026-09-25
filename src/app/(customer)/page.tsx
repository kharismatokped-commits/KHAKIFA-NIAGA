import React from "react";
import Link from "next/link";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { PopularSection } from "@/components/home/PopularSection";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Product } from "@/types/product";
import { prisma } from "@/lib/prisma";
import { mapDbProductToCustomerProduct } from "@/lib/product-mapper";

export default async function HomePage() {
  let allProducts: Product[] = [];

  try {
    const dbProducts = await prisma.product.findMany({
      include: {
        category: true,
        variants: {
          include: {
            priceTiers: {
              orderBy: { minQty: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (dbProducts && dbProducts.length > 0) {
      allProducts = dbProducts.map(mapDbProductToCustomerProduct);
    }
  } catch (err) {
    console.error("Failed to load products from DB:", err);
  }

  const promoProducts = allProducts.filter((p) => p.isPromo);
  const displayPromo = promoProducts.length > 0 ? promoProducts : allProducts.slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* 1. Hero Promo Banner */}
      <HeroBanner />

      {/* 2. Kategori Scroll Horizontal */}
      <CategoryGrid />

      {/* 3. Section Promo Solusi Stok Murah (1 Kolom List Vertikal) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <div>
            <h3 className="font-heading font-black text-base sm:text-lg text-gray-900 tracking-tight flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#F57C00] text-white text-xs font-black uppercase">
                Promo
              </span>
              <span>Solusi Stok Murah</span>
            </h3>
            <p className="text-[12px] sm:text-[13px] text-gray-500">
              Harga grosir spesial untuk menambah margin keuntungan tokomu
            </p>
          </div>
          <Link
            href="/katalog?promo=true"
            className="text-[12px] font-medium text-[#146C43] hover:underline flex items-center gap-0.5 shrink-0"
          >
            <span>Semua</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
          </Link>
        </div>

        {/* 1 Kolom List Vertikal */}
        {displayPromo.length > 0 ? (
          <div className="flex flex-col space-y-3">
            {displayPromo.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
            Belum ada produk promo saat ini.
          </div>
        )}
      </div>

      {/* 4. Produk Populer & Terlaris (1 Kolom List Vertikal) */}
      <PopularSection products={allProducts} />

      {/* 5. Edukasi Cara Order Grosir yang Ringkas */}
      <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="text-center max-w-lg mx-auto">
          <h3 className="font-heading font-black text-base sm:text-lg text-gray-900 mb-1">
            Cara Belanja Grosir di Khalifa Niaga
          </h3>
          <p className="text-xs text-gray-600">
            Pesan cepat tanpa ribet, langsung terhubung ke WhatsApp toko
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs flex items-center sm:flex-col sm:text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#146C43] text-white font-black text-sm flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-gray-900 mb-0.5">Pilih Qty Barang</h4>
              <p className="text-xs text-gray-500 leading-normal">
                Makin banyak beli, harga satuan makin murah otomatis.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs flex items-center sm:flex-col sm:text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#146C43] text-white font-black text-sm flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-gray-900 mb-0.5">Isi Data Toko</h4>
              <p className="text-xs text-gray-500 leading-normal">
                Nama toko, no WA, dan alamat tujuan pengiriman.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs flex items-center sm:flex-col sm:text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#146C43] text-white font-black text-sm flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-gray-900 mb-0.5">Kirim ke WhatsApp</h4>
              <p className="text-xs text-gray-500 leading-normal">
                Format order rapi langsung masuk ke admin WhatsApp toko.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
