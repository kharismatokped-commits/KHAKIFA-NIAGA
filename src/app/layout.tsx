import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { BottomNav } from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "Khalifa Niaga — Grosir Alat Tulis, Plastik & Kelontong",
  description:
    "Aplikasi katalog grosir online dengan harga bertingkat otomatis dan checkout langsung ke WhatsApp toko. Belanja kulakan lebih cepat, murah & terpercaya.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#146C43",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
        <CartProvider>
          {children}
          <BottomNav />
        </CartProvider>
      </body>
    </html>
  );
}
