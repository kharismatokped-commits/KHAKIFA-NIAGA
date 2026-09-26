import React from "react";
import { ProductListSkeleton } from "@/components/product/ProductCardSkeleton";

export default function KatalogLoading() {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Skeleton Header & Search */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="space-y-2">
          <div className="w-48 h-7 bg-gray-200 rounded-md animate-pulse" />
          <div className="w-64 h-3.5 bg-gray-200 rounded-md animate-pulse" />
        </div>

        <div className="w-full h-11 bg-gray-100 rounded-xl animate-pulse" />

        {/* Skeleton Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-28 h-10 bg-gray-100 rounded-xl shrink-0 animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Skeleton Product Cards */}
      <ProductListSkeleton count={5} />
    </div>
  );
}
