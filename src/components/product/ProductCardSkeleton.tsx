"use client";

import React from "react";

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-xs animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Kolom Kiri: Thumbnail + Info */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          {/* Skeleton Thumbnail */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-200 shrink-0" />

          {/* Skeleton Info */}
          <div className="flex-1 min-w-0 space-y-2 py-1">
            {/* Rating / SKU bar */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-3.5 bg-gray-200 rounded-sm" />
              <div className="w-16 h-3 bg-gray-200 rounded-sm hidden sm:block" />
            </div>

            {/* Title bars (2 baris) */}
            <div className="space-y-1.5">
              <div className="w-3/4 h-4 bg-gray-200 rounded-sm" />
              <div className="w-1/2 h-3.5 bg-gray-200 rounded-sm" />
            </div>

            {/* Price bar */}
            <div className="pt-1 flex items-baseline gap-2">
              <div className="w-10 h-3 bg-gray-200 rounded-sm" />
              <div className="w-24 h-5 bg-gray-200 rounded-md" />
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Tombol Beli */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-gray-100 pt-2.5 sm:pt-0 shrink-0">
          <div className="w-16 h-4 bg-gray-200 rounded-sm sm:mb-2" />
          <div className="w-24 sm:w-28 h-9 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const ProductListSkeleton: React.FC<{ count?: number }> = ({
  count = 4,
}) => {
  return (
    <div className="flex flex-col space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};
