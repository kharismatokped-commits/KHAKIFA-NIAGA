import React from "react";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ProductVideoShowcase } from "@/components/home/ProductVideoShowcase";
import { RepeatOrderSection } from "@/components/home/RepeatOrderSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { PopularSection } from "@/components/home/PopularSection";
import { Product } from "@/types/product";
import { prisma } from "@/lib/prisma";
import { mapDbProductToCustomerProduct } from "@/lib/product-mapper";

export const revalidate = 60;

export default async function HomePage() {
  let allProducts: Product[] = [];

  try {
    const dbProducts = await prisma.product.findMany({
      take: 8,
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

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      {/* 1. Hero Promo Banner dengan Video Logo Background */}
      <HeroBanner />

      {/* 2. Showcase Video Produk Unggulan */}
      <ProductVideoShowcase />

      {/* 3. Pesan Lagi (Khusus repeat customer, otomatis tersembunyi untuk new visitor) */}
      <RepeatOrderSection />

      {/* 3. Kategori Scroll Horizontal (1 Baris, Maks 7 Kategori + Tombol Semua Kategori) */}
      <CategoryGrid />

      {/* 4. Produk Terlaris (2 Kolom Grid, 6-8 Produk + Tombol Lihat Semua Produk) */}
      <PopularSection products={allProducts} />
    </div>
  );
}
