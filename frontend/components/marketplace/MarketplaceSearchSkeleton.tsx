"use client";

import React from "react";

export function MarketplaceSearchSkeleton() {
  return (
    <div className="space-y-2 p-2">
      <div className="h-3.5 w-28 bg-border/40 animate-pulse rounded" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 py-2 px-2.5">
          <div className="h-5 w-5 bg-border/40 animate-pulse rounded-full" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-36 bg-border/40 animate-pulse rounded" />
            <div className="h-2 w-20 bg-border/20 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
