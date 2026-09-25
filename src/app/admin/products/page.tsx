"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  X,
  Layers,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

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
  gambarVarian?: string | null;
  priceTiers: PriceTier[];
}

interface Product {
  id: string;
  nama: string;
  deskripsi: string;
  categoryId: string;
  gambar: string[];
  category?: {
    id: string;
    nama: string;
  };
  variants: Variant[];
}

interface Category {
  id: string;
  nama: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successToast, setSuccessToast] = useState("");

  // Form Fields
  const [formData, setFormData] = useState<{
    id?: string;
    nama: string;
    deskripsi: string;
    categoryId: string;
    gambar: string[];
    variants: Variant[];
  }>({
    nama: "",
    deskripsi: "",
    categoryId: "",
    gambar: [""],
    variants: [
      {
        namaVarian: "Standar",
        priceTiers: [
          { jenisKemasan: "pcs", minQty: 1, maxQty: 9, hargaPerUnit: 10000 },
          { jenisKemasan: "pcs", minQty: 10, maxQty: 49, hargaPerUnit: 9000 },
          { jenisKemasan: "pcs", minQty: 50, maxQty: null, hargaPerUnit: 8000 },
        ],
      },
    ],
  });

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProd, resCat] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);

      const dataProd = await resProd.json();
      const dataCat = await resCat.json();

      if (dataProd.success) setProducts(dataProd.data);
      if (dataCat.success) setCategories(dataCat.data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormError("");
    setFormData({
      nama: "",
      deskripsi: "",
      categoryId: categories[0]?.id || "",
      gambar: ["https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80"],
      variants: [
        {
          namaVarian: "Standar",
          priceTiers: [
            { jenisKemasan: "pcs", minQty: 1, maxQty: 9, hargaPerUnit: 10000 },
            { jenisKemasan: "pcs", minQty: 10, maxQty: 49, hargaPerUnit: 9000 },
            { jenisKemasan: "pcs", minQty: 50, maxQty: null, hargaPerUnit: 8000 },
          ],
        },
      ],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormError("");
    setFormData({
      id: product.id,
      nama: product.nama,
      deskripsi: product.deskripsi,
      categoryId: product.categoryId,
      gambar: product.gambar.length > 0 ? product.gambar : [""],
      variants: product.variants.map((v) => ({
        id: v.id,
        namaVarian: v.namaVarian,
        gambarVarian: v.gambarVarian,
        priceTiers: v.priceTiers.map((t) => ({
          id: t.id,
          jenisKemasan: t.jenisKemasan,
          minQty: t.minQty,
          maxQty: t.maxQty,
          hargaPerUnit: t.hargaPerUnit,
        })),
      })),
    });
    setIsModalOpen(true);
  };

  // Helper Variant & Tier Management
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          namaVarian: `Varian ${formData.variants.length + 1}`,
          priceTiers: [
            { jenisKemasan: "pcs", minQty: 1, maxQty: 9, hargaPerUnit: 10000 },
            { jenisKemasan: "pcs", minQty: 10, maxQty: null, hargaPerUnit: 8500 },
          ],
        },
      ],
    });
  };

  const removeVariant = (vIndex: number) => {
    if (formData.variants.length <= 1) {
      alert("Produk minimal harus memiliki 1 varian.");
      return;
    }
    const updated = [...formData.variants];
    updated.splice(vIndex, 1);
    setFormData({ ...formData, variants: updated });
  };

  const addPriceTier = (vIndex: number) => {
    const updated = [...formData.variants];
    const tiers = updated[vIndex].priceTiers;
    const lastTier = tiers[tiers.length - 1];
    const newMin = lastTier ? (lastTier.maxQty ? lastTier.maxQty + 1 : lastTier.minQty + 10) : 1;

    tiers.push({
      jenisKemasan: lastTier?.jenisKemasan || "pcs",
      minQty: newMin,
      maxQty: null,
      hargaPerUnit: lastTier ? Math.max(100, lastTier.hargaPerUnit - 500) : 10000,
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
    value: any
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
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

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
        editingProduct ? "Produk berhasil diperbarui!" : "Produk baru berhasil ditambahkan!"
      );
      setTimeout(() => setSuccessToast(""), 3500);
      setIsModalOpen(false);
      fetchData();
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
      fetchData();
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus produk");
    }
  };

  // Filtered List
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === "all" || p.categoryId === selectedCategory;
    const matchSearch =
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#146C43] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
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
            Atur harga bertingkat grosir otomatis untuk setiap barang dan kemasannya.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#146C43] hover:bg-[#0f5333] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau deskripsi produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146C43]/20 focus:border-[#146C43]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-500 shrink-0">Kategori:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146C43]/20"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#146C43]" />
            Memuat katalog produk dari database...
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3">Produk</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3">Varian & Kemasan</th>
                  <th className="px-5 py-3">Rentang Tier Harga</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
                  const allTiers = p.variants.flatMap((v) => v.priceTiers);
                  const minPrice = allTiers.length > 0 ? Math.min(...allTiers.map((t) => t.hargaPerUnit)) : 0;
                  const maxPrice = allTiers.length > 0 ? Math.max(...allTiers.map((t) => t.hargaPerUnit)) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.gambar[0] || "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=200"}
                            alt={p.nama}
                            className="w-11 h-11 rounded-lg object-cover border border-gray-100 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-gray-900 line-clamp-1">{p.nama}</div>
                            <div className="text-[11px] text-gray-400 line-clamp-1">{p.deskripsi}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-[#146C43] border border-emerald-100">
                          {p.category?.nama || p.categoryId}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-gray-900 font-medium">
                          {p.variants.length} Varian
                        </div>
                        <div className="text-[11px] text-gray-400">
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
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-[#146C43] text-[#146C43] hover:text-white transition-colors cursor-pointer"
                            title="Edit Produk & Tier Harga"
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
                  {editingProduct ? "Edit Produk & Tier Harga" : "Tambah Produk Grosir Baru"}
                </h3>
                <p className="text-xs text-gray-500">
                  Kelola spesifikasi barang dan skema harga bertingkat untuk pembeli partai.
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
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
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
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146C43]/20 focus:border-[#146C43]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Kategori Toko *
                    </label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146C43]/20"
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
                    required
                    placeholder="Deskripsi keunggulan, daya rekat, tebal, dll..."
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146C43]/20 focus:border-[#146C43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    URL Gambar Produk (Utama)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.gambar[0] || ""}
                    onChange={(e) => setFormData({ ...formData, gambar: [e.target.value] })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146C43]/20"
                  />
                </div>
              </div>

              {/* Bagian 2: Varian & Tabel Tier Harga */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    2. Varian & Tabel Tingkat Harga (Price Tiers)
                  </h4>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="text-xs font-semibold text-[#146C43] hover:text-[#0f5333] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Varian Lain</span>
                  </button>
                </div>

                {formData.variants.map((v, vIndex) => (
                  <div
                    key={vIndex}
                    className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-3 relative"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 max-w-xs">
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          Nama Varian
                        </label>
                        <input
                          type="text"
                          required
                          value={v.namaVarian}
                          onChange={(e) => {
                            const updated = [...formData.variants];
                            updated[vIndex].namaVarian = e.target.value;
                            setFormData({ ...formData, variants: updated });
                          }}
                          placeholder="Misal: Standar / Warna Hitam / Ukuran 24mm"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#146C43]"
                        />
                      </div>

                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(vIndex)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Varian</span>
                        </button>
                      )}
                    </div>

                    {/* Dynamic Price Tier Table */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-gray-700">
                          Tingkat Harga Grosir (Berdasarkan Qty Beli):
                        </span>
                        <button
                          type="button"
                          onClick={() => addPriceTier(vIndex)}
                          className="text-[11px] font-bold text-[#146C43] hover:underline flex items-center gap-1 cursor-pointer"
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
                              <th className="px-3 py-2">Maks Qty (Kosongkan jika &gt;)</th>
                              <th className="px-3 py-2">Harga Satuan (Rp)</th>
                              <th className="px-2 py-2 text-center w-10">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {v.priceTiers.map((tier, tIndex) => (
                              <tr key={tIndex}>
                                <td className="px-3 py-1.5">
                                  <input
                                    type="text"
                                    required
                                    value={tier.jenisKemasan}
                                    onChange={(e) =>
                                      updatePriceTierField(
                                        vIndex,
                                        tIndex,
                                        "jenisKemasan",
                                        e.target.value
                                      )
                                    }
                                    placeholder="pcs / pak"
                                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#146C43]"
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
                                        vIndex,
                                        tIndex,
                                        "minQty",
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#146C43]"
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
                                        vIndex,
                                        tIndex,
                                        "maxQty",
                                        e.target.value ? parseInt(e.target.value) : null
                                      )
                                    }
                                    className="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#146C43]"
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
                                          vIndex,
                                          tIndex,
                                          "hargaPerUnit",
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      className="w-28 pl-7 pr-2 py-1 text-xs font-semibold text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#146C43]"
                                    />
                                  </div>
                                </td>
                                <td className="px-2 py-1.5 text-center">
                                  <button
                                    type="button"
                                    disabled={v.priceTiers.length <= 1}
                                    onClick={() => removePriceTier(vIndex, tIndex)}
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
                ))}
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
                  className="px-5 py-2 rounded-xl bg-[#146C43] hover:bg-[#0f5333] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-70 cursor-pointer"
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
          </div>
        </div>
      )}
    </div>
  );
}
