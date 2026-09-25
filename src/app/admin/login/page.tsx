"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("admin@khalifaniaga.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await authClient.signIn.email({
        email,
        password,
      });

      if (res.error) {
        setErrorMessage(
          res.error.message || "Email atau kata sandi tidak sesuai.",
        );
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      console.error("Login catch error:", err);
      setErrorMessage(err.message || "Terjadi kesalahan saat masuk.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-primary rounded-2xl mx-auto flex items-center justify-center font-heading font-black text-2xl text-white shadow-lg shadow-emerald-900/30 mb-3">
            KN
          </div>
          <h1 className="font-heading font-black text-xl text-gray-900 tracking-tight">
            Masuk ke Khalifa Niaga
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Silakan masuk dengan akun terdaftar untuk mengakses seluruh aplikasi
            dan katalog.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Email Administrator
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@khalifaniaga.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-primary hover:bg-primary-dark active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi Akun...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Info Akun Default */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-[11px] text-emerald-900">
            <div className="font-bold flex items-center gap-1.5 text-primary mb-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Akun Administrator
              Tersedia:
            </div>
            <p className="text-gray-600">
              Email:{" "}
              <span className="font-mono font-medium text-gray-900">
                admin@khalifaniaga.com
              </span>
            </p>
            <p className="text-gray-600">
              Password:{" "}
              <span className="font-mono font-medium text-gray-900">
                AdminGrosir2026!
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-gray-900 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-8 text-center text-xs text-gray-500">
            Memuat halaman login...
          </div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
