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
      className="relative overflow-hidden rounded-[26px] text-white px-5 py-5 sm:px-6 sm:py-6"
      style={{
        background: "linear-gradient(135deg, #2E9B63, #146C43)",
        /* Soft UI — glow hero hijau */
        boxShadow: "0 16px 32px rgba(20,108,67,0.30)",
      }}
    >
      {/* Dekorasi lingkaran putih transparan — memberi depth */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "130px", height: "130px", borderRadius: "50%",
          background: "rgba(255,255,255,0.11)",
          top: "-40px", right: "-30px",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: "90px", height: "90px", borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          bottom: "-25px", left: "-20px",
        }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="max-w-xl">
          {/* Judul Banner */}
          <h2 className="font-heading font-bold text-[19px] tracking-tight text-white leading-tight mb-1.5" style={{ letterSpacing: "-0.5px" }}>
            {settings.teksBannerJudul}
          </h2>

          {/* Subjudul Banner */}
          <p className="font-sans text-[12px] text-white/90 mb-3.5 leading-relaxed line-clamp-2">
            {settings.teksBannerSubjudul}
          </p>

          {/* 3 tag kapsul glossy */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: "✅ Harga Bersaing" },
              { label: "🚚 Stok Lengkap" },
              { label: "💬 Order WA" },
            ].map((tag) => (
              <span
                key={tag.label}
                className="font-sans text-[10px] font-bold text-white"
                style={{
                  padding: "5px 10px",
                  borderRadius: "26px",
                  background: "rgba(255,255,255,0.20)",
                  border: "1px solid rgba(255,255,255,0.26)",
                  backdropFilter: "blur(6px)",
                }}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        {/* CTA Button WhatsApp */}
        <div className="shrink-0 pt-1 sm:pt-0">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 h-[44px] bg-white text-[#146C43] hover:bg-emerald-50 rounded-[18px] font-heading font-bold text-[14px] transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            style={{
              boxShadow: "6px 6px 14px rgba(163,177,198,0.30), -6px -6px 14px rgba(255,255,255,0.92)",
            }}
            aria-label="Hubungi via WhatsApp"
          >
            <MessageCircle className="w-5 h-5 text-[#25D366] fill-[#25D366]" strokeWidth={2} />
            <span>Hubungi via WA</span>
          </a>
        </div>
      </div>
    </div>
  );
};
