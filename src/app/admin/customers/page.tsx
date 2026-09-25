"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Store,
  Phone,
  Calendar,
  ShoppingBag,
  ExternalLink,
  RefreshCw,
  X,
  ChevronRight,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface CustomerOrderSummary {
  id: string;
  nomorOrder: string;
  jenisPesanan: string;
  totalHarga: number;
  status: string;
  createdAt: string;
  itemsCount: number;
}

interface Customer {
  id: string;
  namaToko: string;
  namaPemesan: string;
  noWhatsApp: string;
  alamat: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: CustomerOrderSummary[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setCustomers(json.data);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-2.5 h-2.5" /> Baru Masuk
          </span>
        );
      case "confirmed":
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Diproses
          </span>
        );
      case "delivered":
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-2.5 h-2.5" /> Selesai
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-2.5 h-2.5" /> Dibatalkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
            Data Pelanggan & Mitra Toko
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Daftar toko dan pembeli kulakan yang dikelompokkan otomatis berdasarkan riwayat transaksi WhatsApp.
          </p>
        </div>
        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#146C43]" : ""}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama toko, pemesan, no WA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146C43]/20 focus:border-[#146C43]"
          />
        </form>

        <div className="text-xs text-gray-500 font-medium">
          Total: <span className="font-bold text-gray-900">{customers.length}</span> Pelanggan Terdaftar
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#146C43]" />
            Memuat data pelanggan...
          </div>
        ) : customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3">Nama Toko & Pemesan</th>
                  <th className="px-5 py-3">Kontak WhatsApp</th>
                  <th className="px-5 py-3 text-center">Jumlah Pesanan</th>
                  <th className="px-5 py-3">Total Belanja (All-Time)</th>
                  <th className="px-5 py-3">Pesanan Terakhir</th>
                  <th className="px-5 py-3 text-right">Riwayat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{c.namaToko}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        PIC: {c.namaPemesan}
                      </div>
                    </td>

                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`https://wa.me/${c.noWhatsApp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#146C43] hover:bg-emerald-100 font-semibold text-[11px] transition-colors"
                      >
                        <Phone className="w-3 h-3 text-[#146C43]" />
                        <span>{c.noWhatsApp}</span>
                      </a>
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-800">
                        {c.totalOrders} order
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-bold text-emerald-800 text-xs">
                      Rp {c.totalSpent.toLocaleString("id-ID")}
                    </td>

                    <td className="px-5 py-3.5 text-gray-500 text-[11px]">
                      {new Date(c.lastOrderDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(c)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-[#146C43] hover:text-white text-gray-700 text-[11px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Lihat</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-gray-500">
            Belum ada data pelanggan yang cocok dengan pencarian.
          </div>
        )}
      </div>

      {/* Modal Riwayat Pesanan Pelanggan */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-base text-gray-900">
                    {selectedCustomer.namaToko}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                    Mitra Terdaftar
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  PIC: {selectedCustomer.namaPemesan} • {selectedCustomer.noWhatsApp}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[11px] text-gray-500 font-medium block">Total Transaksi</span>
                  <span className="text-base font-black font-heading text-gray-900">
                    {selectedCustomer.totalOrders} Pesanan
                  </span>
                </div>
                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-100 sm:col-span-2">
                  <span className="text-[11px] text-emerald-800 font-medium block">Total Belanja Sepanjang Waktu</span>
                  <span className="text-base font-black font-heading text-emerald-900">
                    Rp {selectedCustomer.totalSpent.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Alamat Pengiriman Terakhir */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 block text-[11px]">Alamat Pengiriman Terakhir:</span>
                  <p className="text-[11px] text-gray-600 mt-0.5">{selectedCustomer.alamat}</p>
                </div>
              </div>

              {/* Daftar Riwayat Transaksi Toko Ini */}
              <div>
                <h4 className="font-bold text-gray-900 mb-2 flex items-center justify-between">
                  <span>Riwayat Semua Pesanan ({selectedCustomer.orders.length}):</span>
                  <a
                    href={`https://wa.me/${selectedCustomer.noWhatsApp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Chat WhatsApp Toko Ini</span>
                  </a>
                </h4>

                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100/75 text-gray-600 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2">No. Order</th>
                        <th className="px-3 py-2">Tanggal</th>
                        <th className="px-3 py-2 text-center">Tipe</th>
                        <th className="px-3 py-2 text-right">Total Tagihan</th>
                        <th className="px-3 py-2 text-center">Status</th>
                        <th className="px-3 py-2 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedCustomer.orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-3 py-2.5 font-mono font-bold text-gray-900">
                            {ord.nomorOrder}
                          </td>
                          <td className="px-3 py-2.5 text-gray-500 text-[11px]">
                            {new Date(ord.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                ord.jenisPesanan === "grosir"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {ord.jenisPesanan}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-gray-900">
                            Rp {ord.totalHarga.toLocaleString("id-ID")}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {getStatusBadge(ord.status)}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <Link
                              href={`/admin/orders?order=${ord.nomorOrder}`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 hover:bg-[#146C43] hover:text-white font-semibold text-[11px] transition-colors"
                            >
                              <span>Buka</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
