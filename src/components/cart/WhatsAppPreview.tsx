"use client";

import React, { useState } from "react";
import { MessageCircle, CheckCheck, Copy, Check } from "lucide-react";
import { STORE_NAME, DEFAULT_STORE_WHATSAPP } from "@/lib/whatsapp";

interface WhatsAppPreviewProps {
  messageText: string;
}

export const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({ messageText }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-xs bg-[#E5DDD5]">
      {/* WA Header */}
      <div className="bg-[#075E54] text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#128C7E] flex items-center justify-center font-bold text-xs">
            KN
          </div>
          <div>
            <div className="font-bold text-xs flex items-center gap-1">
              <span>{STORE_NAME} CS Grosir</span>
              <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
            </div>
            <div className="text-[10px] text-emerald-200">+{DEFAULT_STORE_WHATSAPP}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition-colors"
          title="Salin teks pesan"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Teks</span>
            </>
          )}
        </button>
      </div>

      {/* WA Message Bubble */}
      <div className="p-4 flex justify-end">
        <div className="bg-[#DCF8C6] text-gray-900 rounded-lg rounded-tr-none p-3 shadow-xs max-w-lg text-xs leading-relaxed border border-[#c4e3b0]">
          <pre className="whitespace-pre-wrap font-sans text-xs select-all text-gray-900">
            {messageText}
          </pre>
          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-500">
            <span>Baru saja</span>
            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
