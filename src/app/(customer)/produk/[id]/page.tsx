"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MOCK_PRODUCTS } from "@/data/mockProducts";
import { Product, ProductVariant, UnitType } from "@/types/product";
import { TieredPriceTable } from "@/components/product/TieredPriceTable";
import { QuantityCalculator } from "@/components/product/QuantityCalculator";
import { ProductCard } from "@/components/product/ProductCard";
import { Star, ShieldCheck, ChevronRight, Package, Truck, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | undefined>(() =>
    MOCK_PRODUCTS.find((p) => p.id === resolvedParams.id)
  );
  const [isLoadingProduct, setIsLoadingProduct] = useState(!product);

  React.useEffect(() => {
    fetch(`/api/products/${resolvedParams.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.customerProduct) {
          setProduct(data.customerProduct);
          if (data.customerProduct.variants && data.customerProduct.variants.length > 0) {
            setSelectedVariant(data.customerProduct.variants[0]);
          }
        }
      })
      .catch((e) => console.warn("Fallback to mock:", e))
      .finally(() => setIsLoadingProduct(false));
  }, [resolvedParams.id]);

  // State untuk interaktivitas detail produk
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product?.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [unitType, setUnitType] = useState<UnitType>("PCS");
  const [qty, setQty] = useState<number>(1);

  if (!product && !isLoadingProduct) {
    notFound();
  }

  if (!product) {
    return (
      <div className="p-12 text-center text-xs text-gray-400">
        Memuat detail produk...
      </div>
    );
  }

  // Produk terkait
  const relatedProducts = MOCK_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const handleSelectTierFromTable = (newUnit: UnitType, newQty: number) => {
    setUnitType(newUnit);
    setQty(newQty);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap py-1">
        <Link href="/" className="hover:text-[#146C43] transition-colors">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <Link
          href={`/katalog?kategori=${product.category}`}
          className="hover:text-[#146C43] capitalize transition-colors"
        >
          {product.category.replace("-", " ")}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main Product Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-xs">
        {/* Kolom Kiri: Galeri Foto Produk */}
        <div className="md:col-span-5 space-y-3">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
            <Image
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
            {product.promoTag && (
              <div className="absolute top-3 left-3">
                <Badge variant="promo" className="text-xs font-black uppercase">
                  {product.promoTag}
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnail list jika gambar > 1 */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === idx
                      ? "border-[#146C43] scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Info Trust & Pengiriman */}
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2 font-bold text-gray-800">
              <ShieldCheck className="w-4 h-4 text-[#146C43]" strokeWidth={2.2} />
              <span>Jaminan Grosir Asli & Kondisi Baru</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Truck className="w-4 h-4 text-emerald-600" strokeWidth={2.2} />
              <span>Bisa kirim ekspedisi / ambil langsung di toko grosir</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Rincian Produk, Varian, Kalkulator Qty */}
        <div className="md:col-span-7 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                SKU: {product.sku}
              </span>
              <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating}</span>
                <span className="text-gray-400 font-normal">
                  ({product.reviewCount} ulasan toko)
                </span>
              </div>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Pilihan Varian (Model / Warna) jika ada */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="text-[12px] sm:text-[13px] font-medium text-gray-700">
                Pilih Varian:{" "}
                <span className="text-[#146C43] font-bold">
                  {selectedVariant?.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] sm:text-[13px] font-medium transition-all ${
                        isSelected
                          ? "bg-emerald-50 text-[#146C43] border-[#146C43] shadow-xs ring-1 ring-[#146C43]"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {v.colorHex && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-gray-300"
                          style={{ backgroundColor: v.colorHex }}
                        />
                      )}
                      <span>{v.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Deskripsi Singkat (12–13px) */}
          <div className="text-[12px] sm:text-[13px] leading-relaxed text-gray-600 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-1 text-[13px]">Deskripsi Produk:</h4>
            <p>{product.description}</p>
          </div>

          {/* Kalkulator Jumlah & Subtotal Dinamis */}
          <QuantityCalculator
            product={product}
            selectedVariant={selectedVariant}
            unitType={unitType}
            onUnitTypeChange={setUnitType}
            qty={qty}
            onQtyChange={setQty}
          />
        </div>
      </div>

      {/* Tabel Rincian Harga Bertingkat Penuh */}
      <div className="space-y-2">
        <h3 className="font-bold text-base text-gray-900">
          Rincian Tingkatan Harga Grosir
        </h3>
        <p className="text-xs text-gray-500">
          Klik salah satu baris harga untuk memilih jumlah minimal kuantitas tersebut.
        </p>
        <TieredPriceTable
          product={product}
          currentUnitType={unitType}
          currentQty={qty}
          onSelectTier={handleSelectTierFromTable}
        />
      </div>

      {/* Produk Terkait (1 Kolom List Vertikal) */}
      {relatedProducts.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-gray-200">
          <h3 className="font-heading font-black text-base sm:text-lg text-gray-900">
            Produk Terkait Lainnya
          </h3>
          <div className="flex flex-col space-y-3">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
