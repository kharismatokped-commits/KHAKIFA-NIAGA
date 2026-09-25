import React from "react";
import { CartProvider } from "@/context/CartContext";
import { MOCK_PRODUCTS } from "@/data/mockProducts";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider initialProducts={MOCK_PRODUCTS}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 sm:py-6">
          {children}
        </main>
        <Footer />
        <FloatingWhatsApp />
        <BottomNav />
      </div>
    </CartProvider>
  );
}
