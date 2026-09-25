"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Eye,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  X,
  Phone,
  Store,
  MapPin,
  FileText,
} from "lucide-react";

interface OrderItem {
  id: string;
  productVariantId: string;
  jenisKemasan: string;
  qty: number;
  hargaPerUnit: number;
  subtotal: number;
  productVariant: {
    namaVarian: string;
    product: {
      nama: string;
      gambar: string[];
    };
  };
}

interface Order {
  id: string;
  nomorOrder: string;
  namaPemesan: string;
  namaToko: string;
  noWhatsApp: string;
  alamat: string;
  catatan: string | null;
  jenisPesanan: string;
  totalHarga: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const queryOrderNum = searchParams.get("order");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(queryOrderNum || "");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
        // Jika ada queryOrderNum dari redirect dashboard, buka otomatis
        if (queryOrderNum && json.data.length > 0) {
          const found = json.data.find(
            (o: Order) => o.nomorOrder === queryOrderNum,
          );
          if (found) setSelectedOrder(found);
        }
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, queryOrderNum]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || "Gagal mengubah status pesanan");
        return;
      }

      setToastMessage(`Status pesanan berhasil diubah menjadi: ${newStatus}`);
      setTimeout(() => setToastMessage(""), 3500);

      // Update local state
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      fetchOrders();
    } catch (err) {
      alert("Terjadi kesalahan jaringan saat update status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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
            <RefreshCw className="w-3 h-3 animate-spin" /> Sedang Diproses
          </span>
        );
      case "delivered":
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Selesai / Terkirim
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
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-gray-900 tracking-tight">
            Pesanan Masuk
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Daftar order grosir dan eceran yang dikirim langsung oleh customer.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`}
          />
          <span>Segarkan Pesanan</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari No. Order, Nama, No WA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </form>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "Semua" },
            { id: "pending", label: "Baru Masuk" },
            { id: "processing", label: "Diproses" },
            { id: "delivered", label: "Selesai" },
            { id: "cancelled", label: "Dibatalkan" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-primary text-white shadow-xs"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            Memuat daftar pesanan...
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3">No. Order</th>
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Pelanggan</th>
                  <th className="px-5 py-3">Tipe</th>
                  <th className="px-5 py-3">Total Belanja</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono font-bold text-gray-900">
                      {o.nomorOrder}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-gray-900">
                        {o.namaPemesan}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {o.namaToko ? `Toko: ${o.namaToko}` : o.noWhatsApp}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          o.jenisPesanan === "grosir"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {o.jenisPesanan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">
                      Rp {o.totalHarga.toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-3.5">{getStatusBadge(o.status)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-primary text-primary hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all ml-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Buka</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-gray-500">
            Tidak ada transaksi pesanan yang sesuai filter.
          </div>
        )}
      </div>

      {/* Modal Detail Order */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-base text-gray-900">
                    Order {selectedOrder.nomorOrder}
                  </h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Diterima pada{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Status Update Quick Bar */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-2">
                <span className="font-bold text-gray-700 block">
                  Ubah Status Pesanan:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: "pending", label: "Baru Masuk" },
                    { key: "processing", label: "Diproses / Dikemas" },
                    { key: "delivered", label: "Selesai / Terkirim" },
                    { key: "cancelled", label: "Batalkan" },
                  ].map((s) => (
                    <button
                      key={s.key}
                      disabled={
                        isUpdatingStatus || selectedOrder.status === s.key
                      }
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.id, s.key)
                      }
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                        selectedOrder.status === s.key
                          ? "bg-primary text-white shadow-xs"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Pelanggan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="space-y-1.5">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{selectedOrder.namaPemesan}</span>
                  </div>
                  {selectedOrder.namaToko && (
                    <p className="text-gray-600 font-medium">
                      Toko: {selectedOrder.namaToko}
                    </p>
                  )}
                  <a
                    href={`https://wa.me/${selectedOrder.noWhatsApp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline font-bold"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedOrder.noWhatsApp} (Chat WA)</span>
                  </a>
                </div>

                <div className="space-y-1.5">
                  <div className="text-gray-500 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>{selectedOrder.alamat}</span>
                  </div>
                  {selectedOrder.catatan && (
                    <div className="text-gray-600 flex items-start gap-1.5 italic bg-white p-2 rounded-lg border border-gray-200 mt-1">
                      <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span>&ldquo;{selectedOrder.catatan}&rdquo;</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabel Barang yang Dipesan */}
              <div>
                <h4 className="font-bold text-gray-900 mb-2">
                  Barang yang Dipesan:
                </h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100/75 text-gray-600 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2">Barang</th>
                        <th className="px-3 py-2">Kemasan</th>
                        <th className="px-3 py-2 text-center">Qty</th>
                        <th className="px-3 py-2 text-right">Harga Snapshot</th>
                        <th className="px-3 py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2.5">
                            <div className="font-bold text-gray-900">
                              {item.productVariant?.product?.nama || "Produk"}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              Varian: {item.productVariant?.namaVarian || "-"}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 uppercase font-semibold">
                            {item.jenisKemasan}
                          </td>
                          <td className="px-3 py-2.5 text-center font-bold text-gray-900">
                            {item.qty}
                          </td>
                          <td className="px-3 py-2.5 text-right font-medium text-gray-700">
                            Rp {item.hargaPerUnit.toLocaleString("id-ID")}
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-gray-900">
                            Rp {item.subtotal.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-emerald-50/50 border-t border-gray-200 font-bold">
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-3 text-right text-gray-800"
                        >
                          Total Tagihan Pesanan:
                        </td>
                        <td className="px-3 py-3 text-right text-sm text-primary">
                          Rp {selectedOrder.totalHarga.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-gray-400">
          Memuat daftar pesanan...
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
