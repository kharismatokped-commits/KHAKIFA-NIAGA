"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  TrendingUp,
  Package,
  Layers,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
} from "lucide-react";

interface StatsData {
  ordersToday: number;
  totalOrders: number;
  totalSales: number;
  activeProducts: number;
  recentOrders: Array<{
    id: string;
    nomorOrder: string;
    namaPemesan: string;
    namaToko: string;
    jenisPesanan: string;
    totalHarga: number;
    status: string;
    createdAt: string;
    items: Array<{ id: string; qty: number }>;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async (fresh = false) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/stats${fresh ? "?fresh=true" : ""}`);
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Baru Masuk
          </span>
        );
      case "confirmed":
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <RefreshCw className="w-3 h-3 animate-spin" /> Diproses
          </span>
        );
      case "delivered":
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Selesai
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" /> Dibatalkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
            Dashboard Utama
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Ringkasan performa penjualan dan status operasional toko grosir hari
            ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchStats(true)}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`}
            />
            <span className="hidden sm:inline">Segarkan Data</span>
          </button>
          <Link
            href="/admin/products?action=new"
            className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pesanan Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              Pesanan Hari Ini
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-primary flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-heading text-gray-900">
              {loading ? "..." : (stats?.ordersToday ?? 0)}
            </span>
            <span className="text-xs text-gray-500 ml-1.5">pesanan</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Total riwayat: {stats?.totalOrders ?? 0} pesanan</span>
          </div>
        </div>

        {/* Card 2: Total Penjualan */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              Total Penjualan
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-heading text-gray-900">
              Rp{" "}
              {loading
                ? "..."
                : (stats?.totalSales ?? 0).toLocaleString("id-ID")}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500 font-medium">
            Akumulasi transaksi valid
          </div>
        </div>

        {/* Card 3: Produk Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              Produk Aktif
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-heading text-gray-900">
              {loading ? "..." : (stats?.activeProducts ?? 0)}
            </span>
            <span className="text-xs text-gray-500 ml-1.5">katalog</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-500 font-medium">
            <span>Tersedia untuk pembeli online</span>
          </div>
        </div>

        {/* Card 4: Status Operasional */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              Status Operasional
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-primary flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-base font-bold font-heading text-emerald-800">
              Sistem Aktif
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>WhatsApp Gateway Siap</span>
          </div>
        </div>
      </div>

      {/* Tabel Pesanan Terbaru */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-black text-sm text-gray-900">
              Pesanan Terbaru
            </h2>
            <p className="text-[11px] text-gray-500">
              Daftar transaksi masuk yang perlu dikonfirmasi atau dikirim.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1"
          >
            <span>Semua Pesanan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
            Memuat daftar transaksi terbaru...
          </div>
        ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3">No. Order</th>
                  <th className="px-5 py-3">Pemesan / Toko</th>
                  <th className="px-5 py-3">Tipe Pesanan</th>
                  <th className="px-5 py-3">Total Belanja</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono font-bold text-gray-900">
                      {order.nomorOrder}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-900">
                        {order.namaPemesan}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {order.namaToko || "Pelanggan Eceran"}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          order.jenisPesanan === "grosir"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.jenisPesanan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">
                      Rp {order.totalHarga.toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-3.5">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/orders?order=${order.nomorOrder}`}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-primary hover:text-white text-gray-700 text-[11px] font-semibold transition-all inline-block"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-500">
            Belum ada pesanan masuk saat ini.
          </div>
        )}
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/products"
          className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex items-center gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-primary flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xs text-gray-900">
              Kelola Produk & Tier Harga
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Atur harga eceran, grosir sedang, dan grosir partai besar.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex items-center gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xs text-gray-900">
              Proses Pesanan Masuk
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Update status kirim dan cetak rincian order toko.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex items-center gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xs text-gray-900">
              Kategori & Rak Toko
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Kelola klasifikasi ATK, Plastik Kemasan, dan Sembako.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
