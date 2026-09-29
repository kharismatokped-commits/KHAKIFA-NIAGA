"use client";

import React from "react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { normalizeWhatsAppNumber } from "@/lib/formatters";
import { MessageCircle } from "lucide-react";

export const HeroBanner: React.FC = () => {
  const settings = useStoreSettings();
  const phone =
    normalizeWhatsAppNumber(settings.nomorWhatsApp || "6287789923079") ||
    "6287789923079";
  const defaultMessage =
    process.env.NEXT_PUBLIC_WA_MESSAGE ||
    "Halo, saya tertarik belanja di Khalifa Niaga";
  const waLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div
      style={{ background: "linear-gradient(135deg, #1E7A4E, #2E9B63)" }}
      className="relative overflow-hidden rounded-2xl text-white px-4 py-4 sm:px-6 sm:py-5 shadow-sm"
    >
      {/* Bentuk aksen kurva dekoratif */}
      <div className="absolute top-0 right-0 w-[50%] h-full pointer-events-none">
        <div className="absolute -top-16 -right-12 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute top-1/2 -right-8 w-44 h-44 rounded-full bg-white/5 blur-xs" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="max-w-xl">
          {/* Judul Banner: Poppins 600 */}
          <h2 className="font-heading font-semibold text-base sm:text-lg tracking-tight text-white leading-tight">
            {settings.teksBannerJudul}
          </h2>

          {/* Subjudul Banner: Inter 13px */}
          <p className="font-sans text-[13px] text-white/90 mt-1 line-clamp-2">
            {settings.teksBannerSubjudul}
          </p>

          {/* 3 bullet poin sejajar */}
          <div className="flex items-center gap-x-3 gap-y-1 mt-2.5 text-[11px] font-sans font-medium text-emerald-100 flex-wrap sm:flex-nowrap">
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
            className="inline-flex items-center justify-center gap-2 px-4 h-[44px] bg-white text-[#146C43] hover:bg-emerald-50 rounded-xl font-heading font-medium text-[14px] shadow-sm transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            aria-label="Hubungi via WhatsApp"
          >
            <MessageCircle className="w-5 h-5 text-[#25D366] fill-[#25D366]" strokeWidth={2} />
            <span>Hubungi via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
