"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getPlaceholderByCategory } from "@/lib/placeholders";
import { useDebounce } from "@/hooks/useDebounce";

interface PriceTier {
  id?: string;
  jenisKemasan: string;
  minQty: number;
  maxQty: number | null;
  hargaPerUnit: number;
}

interface Variant {
  id?: string;
  namaVarian: string;
  satuan?: string | null;
  konversi?: number;
  gambarVarian?: string | null;
  priceTiers: PriceTier[];
}

interface ProductListItem {
  id: string;
  nama: string;
  deskripsi: string | null;
  categoryId: string;
  gambar: string[];
  isPromo: boolean;
  category?: {
    id: string;
    nama: string;
    kodeAsal?: string | null;
  };
  variants: Array<{
    id: string;
    namaVarian: string;
    satuan?: string | null;
    konversi?: number;
    priceTiers: Array<{
      id: string;
      jenisKemasan: string;
      minQty: number;
      maxQty: number | null;
      hargaPerUnit: number;
    }>;
  }>;
}

interface Category {
  id: string;
  nama: string;
  kodeAsal?: string | null;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  noPhotoCount: number;
  totalAll: number;
}

function AdminProductsContent() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get("action");

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 350);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [photoFilter, setPhotoFilter] = useState("all"); // "all" | "no_photo" | "has_photo"
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    noPhotoCount: 0,
    totalAll: 0,
  });

  // Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [formError, setFormError] = useState("");
  const [successToast, setSuccessToast] = useState("");

  // Form Fields
  const [formData, setFormData] = useState<{
    id?: string;
    nama: string;
    deskripsi: string;
    categoryId: string;
    gambar: string[];
    isPromo: boolean;
    variants: Variant[];
  }>({
    nama: "",
    deskripsi: "",
    categoryId: "",
    gambar: [],
    isPromo: false,
    variants: [
      {
        namaVarian: "Standar",
        satuan: "pcs",
        konversi: 1,
        priceTiers: [
          { jenisKemasan: "pcs", minQty: 1, maxQty: 9, hargaPerUnit: 10000 },
          { jenisKemasan: "pcs", minQty: 10, maxQty: 49, hargaPerUnit: 9000 },
          { jenisKemasan: "pcs", minQty: 50, maxQty: null, hargaPerUnit: 8000 },
        ],
      },
    ],
  });

  // Fetch Categories sekali saat mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/categories");
        const json = await res.json();
        if (json.success && json.data) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Fetch Products with DB-level Pagination and Filter
  const fetchProducts = useCallback(
    async (pageToFetch = currentPage) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("page", pageToFetch.toString());
        params.set("limit", "20");
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
        if (photoFilter !== "all") params.set("photo", photoFilter);

        const res = await fetch(`/api/admin/products?${params.toString()}`);
        const json = await res.json();
        if (json.success) {
          setProducts(json.data);
          if (json.pagination) {
            setPagination(json.pagination);
          }
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory, debouncedSearch, photoFilter, currentPage],
  );

  // Trigger fetch ketika filter/search/page berubah
  useEffect(() => {
    fetchProducts(currentPage);
  }, [fetchProducts, currentPage]);

  // Reset page ke 1 jika filter atau pencarian berganti
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedSearch, photoFilter]);

  // Handle open modal jika ada parameter ?action=new
  useEffect(() => {
    if (initialAction === "new" && categories.length > 0) {
      openAddModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction, categories]);

  const handleModalFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError("");
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({
          ...prev,
          gambar: [data.url],
        }));
      } else {
        setUploadError(data.error || "Gagal mengunggah gambar.");
      }
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Gagal menghubungi server upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const openAddModal = () => {
    setEditingProductId(null);
    setIsLoadingProduct(false);
    setFormError("");
    setUploadError("");
    setActiveVariantIndex(0);
    setFormData({
      nama: "",
      deskripsi: "",
      categoryId: categories[0]?.id || "",
      gambar: [],
      isPromo: false,
      variants: [
        {
          namaVarian: "Standar",
          satuan: "pcs",
          konversi: 1,
          priceTiers: [
            { jenisKemasan: "pcs", minQty: 1, maxQty: 9, hargaPerUnit: 10000 },
            { jenisKemasan: "pcs", minQty: 10, maxQty: 49, hargaPerUnit: 9000 },
            {
              jenisKemasan: "pcs",
              minQty: 50,
              maxQty: null,
              hargaPerUnit: 8000,
            },
          ],
        },
      ],
    });
    setIsModalOpen(true);
  };

  // On-demand fetch HANYA untuk produk yang diedit (tidak reload seluruh 480 baris)
  const openEditModal = async (productId: string) => {
    setEditingProductId(productId);
    setIsLoadingProduct(true);
    setFormError("");
    setUploadError("");
    setActiveVariantIndex(0);
    setIsModalOpen(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const p = json.data;
        setFormData({
          id: p.id,
          nama: p.nama,
          deskripsi: p.deskripsi || "",
          categoryId: p.categoryId,
          gambar: p.gambar && p.gambar.length > 0 ? p.gambar : [],
          isPromo: Boolean(p.isPromo),
          variants: p.variants.map((v: any) => ({
            id: v.id,
            namaVarian: v.namaVarian,
            satuan: v.satuan || "pcs",
            konversi: v.konversi || 1,
            gambarVarian: v.gambarVarian || null,
            priceTiers: v.priceTiers.map((t: any) => ({
              id: t.id,
              jenisKemasan: t.jenisKemasan,
              minQty: t.minQty,
              maxQty: t.maxQty,
              hargaPerUnit: t.hargaPerUnit,
            })),
          })),
        });
      } else {
        alert(json.error || "Gagal memuat detail produk");
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Error loading product detail:", err);
      alert("Gagal menghubungi server untuk memuat produk.");
      setIsModalOpen(false);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  // Helper Variant & Tier Management
  const addVariant = () => {
    const newIndex = formData.variants.length;
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          namaVarian: `Varian ${newIndex + 1}`,
          satuan: "pcs",
          konversi: 1,
          priceTiers: [
            { jenisKemasan: "pcs", minQty: 1, maxQty: 9, hargaPerUnit: 10000 },
            {
              jenisKemasan: "pcs",
              minQty: 10,
              maxQty: null,
              hargaPerUnit: 8500,
            },
          ],
        },
      ],
    });
    setActiveVariantIndex(newIndex);
  };

  const removeVariant = (vIndex: number) => {
    if (formData.variants.length <= 1) {
      alert("Produk minimal harus memiliki 1 varian.");
      return;
    }
    const updated = formData.variants.filter((_, i) => i !== vIndex);
    setFormData({ ...formData, variants: updated });
    setActiveVariantIndex((prev) => Math.max(0, Math.min(prev, updated.length - 1)));
  };

  const addPriceTier = (vIndex: number) => {
    const updated = [...formData.variants];
    const tiers = updated[vIndex].priceTiers;
    const lastTier = tiers[tiers.length - 1];
    const newMin = lastTier
      ? lastTier.maxQty
        ? lastTier.maxQty + 1
        : lastTier.minQty + 10
      : 1;

    tiers.push({
      jenisKemasan: lastTier?.jenisKemasan || updated[vIndex].satuan || "pcs",
      minQty: newMin,
      maxQty: null,
      hargaPerUnit: lastTier
        ? Math.max(100, lastTier.hargaPerUnit - 500)
        : 10000,
    });

    setFormData({ ...formData, variants: updated });
  };

  const removePriceTier = (vIndex: number, tIndex: number) => {
    const updated = [...formData.variants];
    if (updated[vIndex].priceTiers.length <= 1) {
      alert("Minimal 1 tier harga harus tersedia.");
      return;
    }
    updated[vIndex].priceTiers.splice(tIndex, 1);
    setFormData({ ...formData, variants: updated });
  };

  const updatePriceTierField = (
    vIndex: number,
    tIndex: number,
    field: keyof PriceTier,
    value: any,
  ) => {
    const updated = [...formData.variants];
    updated[vIndex].priceTiers[tIndex] = {
      ...updated[vIndex].priceTiers[tIndex],
      [field]: value,
    };
    setFormData({ ...formData, variants: updated });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSaving(true);

    try {
      const url = editingProductId
        ? `/api/admin/products/${editingProductId}`
        : "/api/admin/products";
      const method = editingProductId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) {
        setFormError(data.error || "Gagal menyimpan produk.");
        setIsSaving(false);
        return;
      }

      setSuccessToast(
        editingProductId
          ? "Produk berhasil diperbarui!"
          : "Produk baru berhasil ditambahkan!",
      );
      setTimeout(() => setSuccessToast(""), 3500);
      setIsModalOpen(false);
      // Refresh hanya halaman aktif (20 item)
      fetchProducts(currentPage);
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Handler
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Hapus produk "${name}" secara permanen?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || "Gagal menghapus produk");
        return;
      }
      setSuccessToast("Produk berhasil dihapus!");
      setTimeout(() => setSuccessToast(""), 3500);
      fetchProducts(currentPage);
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus produk");
    }
  };

  const activeVariant =
    formData.variants[activeVariantIndex] || formData.variants[0];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
            Katalog Produk & Tier Harga
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Atur harga bertingkat grosir otomatis untuk setiap barang dan
            kemasannya.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Filters Bar di Level Database Query */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau varian produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 shrink-0">
              Kategori:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 shrink-0">
              Status Foto:
            </span>
            <select
              value={photoFilter}
              onChange={(e) => setPhotoFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">Semua ({pagination.totalAll || pagination.total})</option>
              <option value="no_photo">
                ⚠️ Belum Ada Foto ({pagination.noPhotoCount})
              </option>
              <option value="has_photo">
                ✓ Sudah Ada Foto (
                {Math.max(
                  0,
                  (pagination.totalAll || pagination.total) -
                    pagination.noPhotoCount,
                )}
                )
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table (Server-side Paginated 20 items) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            Memuat katalog produk dari database...
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/75 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-3">Produk</th>
                    <th className="px-5 py-3">Kategori</th>
                    <th className="px-5 py-3">Varian &amp; Kemasan</th>
                    <th className="px-5 py-3">Rentang Tier Harga</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => {
                    const allTiers = p.variants.flatMap((v) => v.priceTiers);
                    const minPrice =
                      allTiers.length > 0
                        ? Math.min(...allTiers.map((t) => t.hargaPerUnit))
                        : 0;
                    const maxPrice =
                      allTiers.length > 0
                        ? Math.max(...allTiers.map((t) => t.hargaPerUnit))
                        : 0;
                    const hasPhoto = Boolean(
                      p.gambar && p.gambar.length > 0 && p.gambar[0],
                    );
                    const imageSrc = hasPhoto
                      ? p.gambar[0]
                      : getPlaceholderByCategory(
                          p.category?.kodeAsal ||
                            p.category?.nama ||
                            p.categoryId,
                        );

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-gray-50 flex items-center justify-center">
                              <Image
                                src={imageSrc}
                                alt={p.nama}
                                fill
                                sizes="44px"
                                className={
                                  hasPhoto
                                    ? "object-cover"
                                    : "object-contain p-1 bg-[#F9FBFA]"
                                }
                              />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 line-clamp-1 flex items-center gap-1.5">
                                <span>{p.nama}</span>
                                {p.isPromo && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    <Sparkles className="w-2.5 h-2.5" /> Promo
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {hasPhoto ? (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-primary border border-emerald-200">
                                    ✓ Foto Asli
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                    Belum ada foto
                                  </span>
                                )}
                                <span className="text-[11px] text-gray-400 line-clamp-1">
                                  {p.deskripsi || "Tanpa deskripsi"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-primary border border-emerald-100">
                            {p.category?.nama || p.categoryId}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-gray-900 font-medium">
                            {p.variants.length} Varian
                          </div>
                          <div className="text-[11px] text-gray-400 line-clamp-1">
                            {p.variants.map((v) => v.namaVarian).join(", ")}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-emerald-800">
                            {minPrice === maxPrice
                              ? `Rp ${minPrice.toLocaleString("id-ID")}`
                              : `Rp ${minPrice.toLocaleString("id-ID")} – ${maxPrice.toLocaleString("id-ID")}`}
                          </div>
                          <div className="text-[10px] text-gray-400 font-medium">
                            {allTiers.length} tingkat diskon kuantiti
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-primary text-primary hover:text-white transition-colors flex items-center gap-1 text-[11px] font-semibold px-2"
                              title="Edit Lengkap & Upload Foto"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Foto / Edit</span>
                            </Link>
                            <button
                              onClick={() => openEditModal(p.id)}
                              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                              title="Edit Cepat (Modal)"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.nama)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors cursor-pointer"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
              <div>
                Menampilkan{" "}
                <span className="font-bold text-gray-900">
                  {pagination.total === 0
                    ? 0
                    : (pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                sampai{" "}
                <span className="font-bold text-gray-900">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-gray-900">
                  {pagination.total}
                </span>{" "}
                produk
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                <span className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-bold text-gray-900">
                  Halaman {pagination.page} / {Math.max(1, pagination.totalPages)}
                </span>

                <button
                  type="button"
                  disabled={
                    pagination.page >= pagination.totalPages || loading
                  }
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(pagination.totalPages, p + 1),
                    )
                  }
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-xs text-gray-500">
            Tidak ada produk yang cocok dengan pencarian atau filter.
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Produk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h3 className="font-heading font-black text-base text-gray-900">
                  {editingProductId
                    ? "Edit Produk & Tier Harga"
                    : "Tambah Produk Grosir Baru"}
                </h3>
                <p className="text-xs text-gray-500">
                  Kelola spesifikasi barang dan skema harga bertingkat untuk
                  pembeli partai.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {isLoadingProduct ? (
              <div className="p-12 text-center text-xs text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                Memuat data varian dan harga produk...
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-6 overflow-y-auto flex-1"
              >
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Bagian 1: Info Dasar */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-1">
                    1. Informasi Produk
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nama Produk *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Lakban Coklat Daimaru 48mm x 90 Yard"
                        value={formData.nama}
                        onChange={(e) =>
                          setFormData({ ...formData, nama: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Kategori Toko *
                      </label>
                      <select
                        required
                        value={formData.categoryId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categoryId: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Pilih Kategori...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Deskripsi Lengkap
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Deskripsi keunggulan, daya rekat, tebal, dll..."
                      value={formData.deskripsi}
                      onChange={(e) =>
                        setFormData({ ...formData, deskripsi: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  {/* Promo Checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPromoCheckbox"
                      checked={formData.isPromo}
                      onChange={(e) =>
                        setFormData({ ...formData, isPromo: e.target.checked })
                      }
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <label
                      htmlFor="isPromoCheckbox"
                      className="text-xs font-semibold text-gray-700 cursor-pointer"
                    >
                      Tandai sebagai produk promo / Grosir Termurah
                    </label>
                  </div>

                  {/* Gambar Produk & Upload */}
                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-800">
                        Foto Produk
                      </label>
                      {formData.gambar[0] ? (
                        <span className="text-[10px] font-bold text-primary bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ Foto Tersedia
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Menggunakan placeholder kategori
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-200 shrink-0 flex items-center justify-center shadow-2xs">
                        {(() => {
                          const selectedCat = categories.find(
                            (c) => c.id === formData.categoryId,
                          );
                          const placeholderSrc = getPlaceholderByCategory(
                            selectedCat?.kodeAsal ||
                              selectedCat?.nama ||
                              formData.categoryId,
                          );
                          const currentSrc =
                            formData.gambar[0] || placeholderSrc;
                          return (
                            <Image
                              src={currentSrc}
                              alt="Foto Produk"
                              fill
                              sizes="80px"
                              className={
                                formData.gambar[0]
                                  ? "object-cover"
                                  : "object-contain p-2 bg-[#F9FBFA]"
                              }
                            />
                          );
                        })()}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-2xs transition-colors">
                            {isUploading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Mengupload...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload File Gambar</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploading}
                              onChange={handleModalFileUpload}
                              className="hidden"
                            />
                          </label>
                          {formData.gambar[0] && (
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, gambar: [] })
                              }
                              className="px-2.5 py-1.5 text-xs text-red-600 hover:text-red-700 font-medium hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              Hapus Foto
                            </button>
                          )}
                        </div>

                        {uploadError && (
                          <p className="text-[11px] text-red-600 font-medium">
                            {uploadError}
                          </p>
                        )}

                        <div className="pt-1">
                          <input
                            type="url"
                            placeholder="Atau tempel URL gambar langsung..."
                            value={formData.gambar[0] || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                gambar: e.target.value ? [e.target.value] : [],
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bagian 2: Varian & Render Tier Hanya untuk Variant yang Sedang Dibuka */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      2. Varian &amp; Skema Harga Bertingkat
                    </h4>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Varian Baru</span>
                    </button>
                  </div>

                  {/* Tabs Pemilih Varian yang Sedang Dibuka */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-gray-100">
                    {formData.variants.map((v, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveVariantIndex(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                          activeVariantIndex === idx
                            ? "bg-primary text-white shadow-xs"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <span>{v.namaVarian || `Varian ${idx + 1}`}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            activeVariantIndex === idx
                              ? "bg-white/20 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {v.priceTiers.length} tier
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Form & Tabel Tier HANYA untuk Varian yang Aktif */}
                  {activeVariant && (
                    <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <div className="sm:col-span-1">
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Nama Varian
                          </label>
                          <input
                            type="text"
                            required
                            value={activeVariant.namaVarian}
                            onChange={(e) => {
                              const updated = [...formData.variants];
                              updated[activeVariantIndex].namaVarian =
                                e.target.value;
                              setFormData({ ...formData, variants: updated });
                            }}
                            placeholder="Misal: Standar / 24mm"
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Satuan Kemasan Dasar
                          </label>
                          <input
                            type="text"
                            value={activeVariant.satuan || "pcs"}
                            onChange={(e) => {
                              const updated = [...formData.variants];
                              updated[activeVariantIndex].satuan =
                                e.target.value;
                              setFormData({ ...formData, variants: updated });
                            }}
                            placeholder="pcs / pak"
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2">
                          {formData.variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVariant(activeVariantIndex)}
                              className="text-xs text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1 cursor-pointer py-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Varian Ini</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Tabel Tier Hanya untuk Varian Aktif */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-gray-700">
                            Tingkat Harga Grosir (Berdasarkan Qty Beli):
                          </span>
                          <button
                            type="button"
                            onClick={() => addPriceTier(activeVariantIndex)}
                            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Tambah Baris Tier</span>
                          </button>
                        </div>

                        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-2xs">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-gray-100/75 text-gray-600 font-semibold border-b border-gray-200 text-[11px]">
                              <tr>
                                <th className="px-3 py-2">Kemasan</th>
                                <th className="px-3 py-2">Min Qty</th>
                                <th className="px-3 py-2">
                                  Maks Qty (Kosongkan jika &gt;)
                                </th>
                                <th className="px-3 py-2">Harga Satuan (Rp)</th>
                                <th className="px-2 py-2 text-center w-10">
                                  Aksi
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {activeVariant.priceTiers.map((tier, tIndex) => (
                                <tr key={tIndex}>
                                  <td className="px-3 py-1.5">
                                    <input
                                      type="text"
                                      required
                                      value={tier.jenisKemasan}
                                      onChange={(e) =>
                                        updatePriceTierField(
                                          activeVariantIndex,
                                          tIndex,
                                          "jenisKemasan",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="pcs / pak"
                                      className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                  </td>
                                  <td className="px-3 py-1.5">
                                    <input
                                      type="number"
                                      min="1"
                                      required
                                      value={tier.minQty}
                                      onChange={(e) =>
                                        updatePriceTierField(
                                          activeVariantIndex,
                                          tIndex,
                                          "minQty",
                                          parseInt(e.target.value) || 1,
                                        )
                                      }
                                      className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                  </td>
                                  <td className="px-3 py-1.5">
                                    <input
                                      type="number"
                                      min="1"
                                      value={tier.maxQty ?? ""}
                                      placeholder="Tak hingga (+)"
                                      onChange={(e) =>
                                        updatePriceTierField(
                                          activeVariantIndex,
                                          tIndex,
                                          "maxQty",
                                          e.target.value
                                            ? parseInt(e.target.value)
                                            : null,
                                        )
                                      }
                                      className="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                  </td>
                                  <td className="px-3 py-1.5">
                                    <div className="relative">
                                      <span className="absolute left-2 top-1 text-gray-400 text-[11px]">
                                        Rp
                                      </span>
                                      <input
                                        type="number"
                                        min="100"
                                        step="50"
                                        required
                                        value={tier.hargaPerUnit}
                                        onChange={(e) =>
                                          updatePriceTierField(
                                            activeVariantIndex,
                                            tIndex,
                                            "hargaPerUnit",
                                            parseInt(e.target.value) || 0,
                                          )
                                        }
                                        className="w-28 pl-7 pr-2 py-1 text-xs font-semibold text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                      />
                                    </div>
                                  </td>
                                  <td className="px-2 py-1.5 text-center">
                                    <button
                                      type="button"
                                      disabled={
                                        activeVariant.priceTiers.length <= 1
                                      }
                                      onClick={() =>
                                        removePriceTier(
                                          activeVariantIndex,
                                          tIndex,
                                        )
                                      }
                                      className="text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer p-1"
                                      title="Hapus Tier"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-70 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan Produk</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-gray-400">
          Memuat katalog produk...
        </div>
      }
    >
      <AdminProductsContent />
    </Suspense>
  );
}
