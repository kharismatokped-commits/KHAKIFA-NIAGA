"use client";

import React, { useEffect, useState } from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BookOpen,
  Home,
  Package,
  Store,
  LayoutGrid,
  Tag,
} from "lucide-react";

interface Category {
  id: string;
  nama: string;
  ikon: string;
  _count?: {
    products: number;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ id: "", nama: "", ikon: "BookOpen" });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const availableIcons = [
    { name: "BookOpen", label: "Alat Tulis (Buku)" },
    { name: "Package", label: "Plastik / Kemasan" },
    { name: "Home", label: "Rumah Tangga" },
    { name: "Store", label: "Sembako / Toko" },
    { name: "LayoutGrid", label: "Umum / Grid" },
    { name: "Tag", label: "Promo / Tag" },
  ];

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ id: "", nama: "", ikon: "BookOpen" });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({ id: cat.id, nama: cat.nama, ikon: cat.ikon });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSaving(true);

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || "Gagal menyimpan kategori.");
        setIsSaving(false);
        return;
      }

      setToastMessage(
        editingCategory ? "Kategori berhasil diperbarui!" : "Kategori baru berhasil ditambahkan!"
      );
      setTimeout(() => setToastMessage(""), 3500);
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus kategori "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || "Gagal menghapus kategori.");
        return;
      }
      setToastMessage("Kategori berhasil dihapus!");
      setTimeout(() => setToastMessage(""), 3500);
      fetchCategories();
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus kategori.");
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "BookOpen":
        return <BookOpen className="w-5 h-5 text-emerald-700" />;
      case "Package":
        return <Package className="w-5 h-5 text-emerald-700" />;
      case "Home":
        return <Home className="w-5 h-5 text-emerald-700" />;
      case "Store":
        return <Store className="w-5 h-5 text-emerald-700" />;
      case "Tag":
        return <Tag className="w-5 h-5 text-emerald-700" />;
      default:
        return <LayoutGrid className="w-5 h-5 text-emerald-700" />;
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#146C43] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
            Kategori Produk
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola pengelompokan produk toko (ATK, Plastik Kemasan, Sembako, Rumah Tangga).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#146C43] hover:bg-[#0f5333] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#146C43]" />
            Memuat data kategori...
          </div>
        ) : categories.length > 0 ? (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-start justify-between gap-3 hover:border-emerald-200 transition-all"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                  {renderIcon(cat.ikon)}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-gray-900">
                    {cat.nama}
                  </h3>
                  <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                    ID: {cat.id}
                  </div>
                  <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                    {cat._count?.products ?? 0} Produk Terkait
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-[#146C43] text-[#146C43] hover:text-white transition-colors cursor-pointer"
                  title="Edit Kategori"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.nama)}
                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors cursor-pointer"
                  title="Hapus Kategori"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-8 text-center text-xs text-gray-500 bg-white rounded-2xl border border-gray-100">
            Belum ada kategori yang ditambahkan.
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit Kategori */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-heading font-black text-sm text-gray-900">
                {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Alat Tulis Kantor (ATK)"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146C43]/20 focus:border-[#146C43]"
                />
              </div>

              {!editingCategory && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Slug ID Kategori (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="atk / plastik-kemasan / rumah-tangga"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146C43]/20"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Jika dikosongkan, ID dibuat otomatis dari nama kategori.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Pilih Ikon Representasi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableIcons.map((ic) => (
                    <button
                      key={ic.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, ikon: ic.name })}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        formData.ikon === ic.name
                          ? "border-[#146C43] bg-emerald-50/70 text-[#146C43] font-bold ring-1 ring-[#146C43]"
                          : "border-gray-200 hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      {renderIcon(ic.name)}
                      <span className="text-[10px] leading-tight">{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
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
                      <span>Simpan Kategori</span>
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
