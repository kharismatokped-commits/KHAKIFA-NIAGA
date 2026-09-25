"use client";

import React from "react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { normalizeWhatsAppNumber } from "@/lib/formatters";
import { MessageCircle } from "lucide-react";

export const HeroBanner: React.FC = () => {
  const settings = useStoreSettings();
  const phone = normalizeWhatsAppNumber(settings.nomorWhatsApp || "6287789923079") || "6287789923079";
  const defaultMessage = process.env.NEXT_PUBLIC_WA_MESSAGE || "Halo, saya tertarik belanja di Khalifa Niaga";
  const waLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#157948] text-white px-4 py-3.5 sm:px-6 sm:py-4 shadow-xs">
      {/* Bentuk kurva hijau muda di sisi kanan */}
      <div className="absolute top-0 right-0 w-[50%] h-full pointer-events-none">
        <div className="absolute -top-16 -right-12 w-64 h-64 rounded-full bg-[#208f57]/50" />
        <div className="absolute top-1/2 -right-8 w-44 h-44 rounded-full bg-[#289a60]/40 blur-xs" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="max-w-xl">
          {/* 1 Baris Judul Dinamis */}
          <h2 className="font-heading font-black text-base sm:text-lg tracking-tight text-white leading-tight">
            {settings.teksBannerJudul}
          </h2>

          {/* 1 Baris Subjudul Dinamis dari Pengaturan Toko */}
          <p className="text-[11px] sm:text-[12px] font-medium text-white/95 mt-1 line-clamp-2">
            {settings.teksBannerSubjudul}
          </p>

          {/* 3 bullet sejajar 1 baris */}
          <div className="flex items-center gap-x-3 gap-y-1 mt-2 text-[10px] sm:text-[11px] font-semibold text-emerald-100 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0"></span>
              <span>Harga Bersaing</span>
            </div>
            <span className="text-white/40 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0"></span>
              <span>Stok Lengkap</span>
            </div>
            <span className="text-white/40 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0"></span>
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
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#146C43] hover:bg-emerald-50 rounded-xl font-heading font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap min-h-[40px]"
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
