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

// In-memory module cache untuk mencegah re-fetching berulang antar tab
let cachedSettings: StoreSettings | null = null;
let settingsPromise: Promise<StoreSettings> | null = null;

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(
    cachedSettings || DEFAULT_STORE_SETTINGS,
  );

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings);
      return;
    }

    if (!settingsPromise) {
      settingsPromise = fetch("/api/settings")
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data) {
            cachedSettings = res.data;
            return res.data;
          }
          return DEFAULT_STORE_SETTINGS;
        })
        .catch(() => DEFAULT_STORE_SETTINGS);
    }

    settingsPromise.then((data) => {
      setSettings(data);
    });
  }, []);

  return settings;
}
