"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  Store,
  Phone,
  MapPin,
  Megaphone,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface StoreSettingsData {
  id: string;
  namaToko: string;
  nomorWhatsApp: string;
  alamatToko: string;
  teksBannerJudul: string;
  teksBannerSubjudul: string;
}

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState<StoreSettingsData>({
    id: "default",
    namaToko: "Khalifa Niaga",
    nomorWhatsApp: "6287789923079",
    alamatToko: "Pasar Pagi Grosir Blok A No. 12, Jakarta",
    teksBannerJudul: "Solusi Belanja Grosir Cepat & Murah",
    teksBannerSubjudul: "Katalog online harga bertingkat resmi. Pesan langsung terhubung ke WhatsApp toko.",
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.success && json.data) {
        setFormData(json.data);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || "Gagal menyimpan pengaturan toko.");
        setIsSaving(false);
        return;
      }

      setToastMessage("Pengaturan toko berhasil disimpan! Tampilan aplikasi customer telah diperbarui.");
      setTimeout(() => setToastMessage(""), 4000);
      setFormData(data.data);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#146C43] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
            Pengaturan Toko & Informasi Publik
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola identitas toko, nomor WhatsApp tujuan checkout pesanan, dan teks banner promosi beranda.
          </p>
        </div>
        <button
          onClick={fetchSettings}
          disabled={loading}
          className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#146C43]" : ""}`} />
          <span>Reset Formulir</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#146C43]" />
          Memuat pengaturan toko dari database...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Profil Toko & Kontak WhatsApp */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Store className="w-4 h-4 text-emerald-700" />
              <h2 className="font-heading font-black text-sm text-gray-900">
                1. Identitas Toko & Nomor WhatsApp Pesanan
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nama Toko *
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaToko}
                  onChange={(e) => setFormData({ ...formData, namaToko: e.target.value })}
                  placeholder="Contoh: Khalifa Niaga"
                  className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146C43]/20 focus:border-[#146C43]"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Tampil pada header aplikasi customer dan rincian pesanan.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nomor WhatsApp Toko (Tujuan Checkout) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.nomorWhatsApp}
                    onChange={(e) => setFormData({ ...formData, nomorWhatsApp: e.target.value })}
                    placeholder="Contoh: 6287789923079"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146C43]/20 focus:border-[#146C43] font-mono font-semibold"
                  />
                </div>
                <p className="text-[11px] text-emerald-700 font-medium mt-1">
                  Gunakan format internasional tanpa spasi/tanda plus (contoh: 6287789923079).
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Alamat Fisik / Lokasi Toko
              </label>
              <textarea
                rows={2}
                required
                value={formData.alamatToko}
                onChange={(e) => setFormData({ ...formData, alamatToko: e.target.value })}
                placeholder="Pasar Pagi Grosir Blok A No. 12, Jakarta"
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146C43]/20 focus:border-[#146C43]"
              />
            </div>
          </div>

          {/* Section 2: Banner Promosi Beranda */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Megaphone className="w-4 h-4 text-emerald-700" />
              <h2 className="font-heading font-black text-sm text-gray-900">
                2. Teks Banner Promosi Beranda
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Judul Banner (1 Baris Ringkas) *
              </label>
              <input
                type="text"
                required
                value={formData.teksBannerJudul}
                onChange={(e) => setFormData({ ...formData, teksBannerJudul: e.target.value })}
                placeholder="Contoh: Solusi Belanja Grosir Cepat & Murah"
                className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146C43]/20 focus:border-[#146C43]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Subjudul Banner (1 Baris Penjelas) *
              </label>
              <input
                type="text"
                required
                value={formData.teksBannerSubjudul}
                onChange={(e) => setFormData({ ...formData, teksBannerSubjudul: e.target.value })}
                placeholder="Contoh: Katalog online harga bertingkat resmi. Pesan langsung terhubung ke WhatsApp toko."
                className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146C43]/20 focus:border-[#146C43]"
              />
            </div>

            {/* Live Banner Preview Card */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Pratinjau Langsung Banner di Halaman Customer:
              </span>
              <div className="bg-[#146C43] text-white rounded-xl p-4 sm:p-5 shadow-sm">
                <h3 className="font-heading font-black text-base sm:text-lg tracking-tight">
                  {formData.teksBannerJudul || "Judul Banner Toko"}
                </h3>
                <p className="text-xs sm:text-[13px] text-emerald-100 mt-1">
                  {formData.teksBannerSubjudul || "Subjudul penjelas promosi toko"}
                </p>
                <div className="mt-3 flex items-center gap-3 text-[11px] text-emerald-200 font-medium">
                  <span>✓ Harga Bersaing</span>
                  <span>•</span>
                  <span>✓ Stok Lengkap</span>
                  <span>•</span>
                  <span>✓ Kirim Cepat</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-[#146C43] hover:bg-[#0f5333] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-900/20 transition-all disabled:opacity-70 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Pengaturan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Pengaturan</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
