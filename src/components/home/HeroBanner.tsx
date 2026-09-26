"use client";

import React, { useEffect, useState } from "react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { normalizeWhatsAppNumber } from "@/lib/formatters";
import { MessageCircle, Sparkles } from "lucide-react";

export const HeroBanner: React.FC = () => {
  const settings = useStoreSettings();
  const [shouldUseFallback, setShouldUseFallback] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const conn = (navigator as unknown as {
        connection?: { saveData?: boolean; effectiveType?: string };
      })?.connection;
      const isSlow = conn
        ? Boolean(
            conn.saveData ||
              conn.effectiveType === "slow-2g" ||
              conn.effectiveType === "2g"
          )
        : false;

      if (prefersReducedMotion || isSlow) {
        setShouldUseFallback(true);
      }
    }
  }, []);

  const phone =
    normalizeWhatsAppNumber(settings.nomorWhatsApp || "6287789923079") ||
    "6287789923079";
  const defaultMessage =
    process.env.NEXT_PUBLIC_WA_MESSAGE ||
    "Halo, saya tertarik belanja di Khalifa Niaga";
  const waLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(
    defaultMessage
  )}`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0c3b24] text-white px-4 py-4 sm:px-6 sm:py-5 shadow-sm border border-emerald-900/30">
      {/* Background Video atau Poster Fallback */}
      {!shouldUseFallback ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/videos/hero-poster.jpg"
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-40 mix-blend-screen scale-105 transition-opacity duration-700"
          aria-hidden="true"
        >
          <source src="/videos/hero-logo.mp4" type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30 pointer-events-none"
          style={{ backgroundImage: "url('/videos/hero-poster.jpg')" }}
          aria-hidden="true"
        />
      )}

      {/* Overlay Gradient untuk Menjaga Kontras & Keterbacaan Teks */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#0c3b24]/95 via-[#0c3b24]/80 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Bentuk dekoratif aksen cahaya */}
      <div className="absolute top-0 right-0 w-[45%] h-full pointer-events-none">
        <div className="absolute -top-16 -right-12 w-64 h-64 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="absolute top-1/2 -right-8 w-44 h-44 rounded-full bg-teal-400/15 blur-xl" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
        <div className="max-w-xl">
          {/* Badge Cinematic Promosi */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/30 text-[10px] sm:text-[11px] font-semibold text-emerald-200 mb-2">
            <Sparkles className="w-3 h-3 text-emerald-300" />
            <span>Pusat Grosir & Eceran Terpercaya</span>
          </div>

          {/* 1 Baris Judul Dinamis */}
          <h2 className="font-heading font-black text-base sm:text-lg tracking-tight text-white leading-tight">
            {settings.teksBannerJudul}
          </h2>

          {/* 1 Baris Subjudul Dinamis dari Pengaturan Toko */}
          <p className="text-[11px] sm:text-[12px] font-medium text-emerald-100/90 mt-1 line-clamp-2">
            {settings.teksBannerSubjudul}
          </p>

          {/* 3 bullet sejajar 1 baris */}
          <div className="flex items-center gap-x-3 gap-y-1 mt-2.5 text-[10px] sm:text-[11px] font-semibold text-emerald-200 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
              <span>Harga Bersaing</span>
            </div>
            <span className="text-emerald-400/40 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
              <span>Stok Lengkap</span>
            </div>
            <span className="text-emerald-400/40 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
              <span>Pengiriman Cepat</span>
            </div>
          </div>
        </div>

        {/* CTA Button menuju WhatsApp */}
        <div className="shrink-0 pt-1 sm:pt-0">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-primary hover:bg-emerald-50 rounded-xl font-heading font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap min-h-[40px]"
            aria-label="Hubungi via WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
            <span>Hubungi via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
