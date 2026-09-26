import React from "react";
import { ProductListSkeleton } from "@/components/product/ProductCardSkeleton";

export default function CustomerLoading() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Skeleton Banner */}
      <div className="w-full h-36 sm:h-48 bg-gray-200 rounded-2xl animate-pulse" />

      {/* Skeleton Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-24 h-9 bg-gray-100 rounded-xl shrink-0 animate-pulse"
          />
        ))}
      </div>

      {/* Skeleton Product Cards */}
      <ProductListSkeleton count={4} />
    </div>
  );
}
