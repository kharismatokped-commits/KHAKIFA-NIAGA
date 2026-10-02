import type { Metadata, Viewport } from "next";
import { Poppins, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { BottomNav } from "@/components/layout/BottomNav";
import { CartDrawer } from "@/components/cart/CartDrawer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Khalifa Niaga — Grosir Alat Tulis, Plastik & Kelontong",
  description:
    "Aplikasi katalog grosir online dengan harga bertingkat otomatis dan checkout langsung ke WhatsApp toko. Belanja kulakan lebih cepat, murah & terpercaya.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/icon.png",
  },
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
    <html lang="id" className={`${poppins.variable} ${inter.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-[#EEF0F8] text-[#1F2340] font-sans antialiased" style={{ fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
        <CartProvider>
          {children}
          <BottomNav />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
