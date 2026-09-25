"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { normalizeWhatsAppNumber } from "@/lib/formatters";

export const FloatingWhatsApp: React.FC = () => {
  const settings = useStoreSettings();
  const phone = normalizeWhatsAppNumber(settings.nomorWhatsApp || "6287789923079") || "6287789923079";
  const defaultMessage = process.env.NEXT_PUBLIC_WA_MESSAGE || "Halo, saya tertarik belanja di Khalifa Niaga";
  const waLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside aria-label="WhatsApp Chat" className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40">
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-pulse flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 group font-heading font-bold text-xs"
        aria-label="Hubungi via WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-white text-white" />
        <span className="hidden sm:inline font-bold">Hubungi via WhatsApp</span>
      </a>
    </aside>
  );
};
