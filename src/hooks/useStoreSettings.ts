"use client";

import { useState, useEffect } from "react";

export interface StoreSettings {
  namaToko: string;
  nomorWhatsApp: string;
  alamatToko: string;
  teksBannerJudul: string;
  teksBannerSubjudul: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  namaToko: "Khalifa Niaga",
  nomorWhatsApp: "6287789923079",
  alamatToko: "Pasar Pagi Grosir Blok A No. 12, Jakarta",
  teksBannerJudul: "Khalifa Niaga — Solusi Stok Murah untuk Pedagang",
  teksBannerSubjudul:
    "Katalog online harga bertingkat resmi. Pesan langsung terhubung ke WhatsApp toko.",
};

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(
    DEFAULT_STORE_SETTINGS,
  );

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
        }
      })
      .catch(() => {
        // Fallback silently to DEFAULT_STORE_SETTINGS
      });
  }, []);

  return settings;
}
