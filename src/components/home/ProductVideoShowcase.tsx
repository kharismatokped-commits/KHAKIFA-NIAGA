"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

interface ShowcaseItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  searchQuery: string;
  videoSrc: string;
  posterSrc: string;
}

const SHOWCASE_PRODUCTS: ShowcaseItem[] = [
  {
    id: "plastik-cap-satu",
    title: "Plastik Cap Satu",
    subtitle: "Kuat, tebal & tahan air (1 Ikat Isi 10)",
    badge: "KEMASAN UNGGULAN",
    badgeColor: "bg-amber-600/90 text-white",
    searchQuery: "Plastik Cap",
    videoSrc: "/videos/showcase-1.mp4",
    posterSrc: "/images/products/plastik-cap-satu.jpg",
  },
  {
    id: "kertas-sidu",
    title: "Kertas HVS SiDU 70g",
    subtitle: "Putih bersih & hasil cetak tajam",
    badge: "ATK TERLARIS",
    badgeColor: "bg-blue-600/90 text-white",
    searchQuery: "Sidu",
    videoSrc: "/videos/showcase-2.mp4",
    posterSrc: "/images/products/kertas-sidu.jpg",
  },
  {
    id: "pulpen-faster",
    title: "Pulpen Faster F3",
    subtitle: "0.5mm tinta pekat anti macet 12 pcs",
    badge: "PILIHAN TOKO",
    badgeColor: "bg-emerald-600/90 text-white",
    searchQuery: "Faster",
    videoSrc: "/videos/showcase-3.mp4",
    posterSrc: "/images/products/pulpen-faster.jpg",
  },
  {
    id: "pulpen-snowman",
    title: "Pulpen Snowman V-2",
    subtitle: "Hi-Grip 0.6mm Black 1 Lusin",
    badge: "FAVORIT KANTOR",
    badgeColor: "bg-slate-700/90 text-white",
    searchQuery: "Snowman",
    videoSrc: "/videos/showcase-4.mp4",
    posterSrc: "/images/products/pulpen-snowman.jpg",
  },
];

const VideoCard: React.FC<{
  item: ShowcaseItem;
  shouldUseFallback: boolean;
}> = ({ item, shouldUseFallback }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (shouldUseFallback) return;

    const el = containerRef.current;
    if (!el) return;

    // Observer 1: Lazy load video saat mendekati viewport (margin 250px)
    const lazyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsNearViewport(true);
            lazyObserver.disconnect();
          }
        });
      },
      { rootMargin: "250px" }
    );
    lazyObserver.observe(el);

    // Observer 2: Autoplay saat video masuk viewport, pause saat keluar
    const playObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = videoRef.current;
          if (!video) return;

          if (entry.isIntersecting) {
            video
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => {
                setIsPlaying(false);
              });
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.35 }
    );
    playObserver.observe(el);

    return () => {
      lazyObserver.disconnect();
      playObserver.disconnect();
    };
  }, [shouldUseFallback]);

  return (
    <div
      ref={containerRef}
      className="relative shrink-0 w-[240px] sm:w-auto rounded-2xl overflow-hidden shadow-xs border border-border/60 bg-surface group snap-center flex flex-col transition-all duration-300 hover:shadow-md"
    >
      {/* Container Video / Gambar Poster */}
      <div className="relative aspect-square w-full bg-slate-900 overflow-hidden">
        {shouldUseFallback ? (
          <Image
            src={item.posterSrc}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 240px, 25vw"
          />
        ) : (
          <>
            {isNearViewport && (
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                poster={item.posterSrc}
                preload="metadata"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              >
                <source src={item.videoSrc} type="video/mp4" />
              </video>
            )}
            {!isNearViewport && (
              <Image
                src={item.posterSrc}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 240px, 25vw"
              />
            )}
          </>
        )}

        {/* Badge status / promo di pojok kiri atas */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-xs ${item.badgeColor}`}
          >
            {item.badge}
          </span>
        </div>

        {/* Indikator motion halus di pojok kanan atas */}
        {!shouldUseFallback && isPlaying && (
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] text-white/90 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Showcase</span>
          </div>
        )}

        {/* Dark Gradient Overlay untuk Keterbacaan Teks */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Info Teks & Headline di atas video */}
        <div className="absolute bottom-0 inset-x-0 p-3 text-white z-10">
          <h3 className="font-heading font-black text-sm leading-snug line-clamp-1 drop-shadow-xs">
            {item.title}
          </h3>
          <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5">
            {item.subtitle}
          </p>

          <Link
            href={`/katalog?q=${encodeURIComponent(item.searchQuery)}`}
            className="mt-2.5 inline-flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg bg-white/95 hover:bg-white text-primary text-[11px] font-bold shadow-xs transition-all active:scale-95 group-hover:bg-primary group-hover:text-white"
          >
            <span>Cari Produk Ini</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export const ProductVideoShowcase: React.FC = () => {
  const [shouldUseFallback, setShouldUseFallback] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const conn = (navigator as unknown as {
        connection?: { saveData?: boolean; effectiveType?: string };
      })?.connection;
      const isSlow = conn
        ? Boolean(
            conn.saveData ||
              conn.effectiveType === "slow-2g" ||
              conn.effectiveType === "2g"
          )
        : false;

      if (prefersReducedMotion || isSlow) {
        setShouldUseFallback(true);
      }
    }
  }, []);

  return (
    <section className="space-y-2.5">
      {/* Header Section Showcase */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-primary flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-sm text-foreground leading-tight">
              Produk Pilihan Unggulan
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Koleksi terlaris dengan kualitas terjamin
            </p>
          </div>
        </div>
        <Link
          href="/katalog"
          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Grid di Desktop (4 kolom), Carousel/Scroll Horisontal di Mobile */}
      <div className="flex sm:grid sm:grid-cols-4 gap-3 overflow-x-auto pb-1 sm:pb-0 snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {SHOWCASE_PRODUCTS.map((item) => (
          <VideoCard
            key={item.id}
            item={item}
            shouldUseFallback={shouldUseFallback}
          />
        ))}
      </div>
    </section>
  );
};
