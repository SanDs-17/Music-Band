"use client";

import React from "react";
import { useMarketplaceStore } from "@/features/marketplace/stores/useMarketplaceStore";

interface MarketplaceSearchSummaryProps {
  total: number;
  entityType: "artists" | "venues";
}

export function MarketplaceSearchSummary({ total, entityType }: MarketplaceSearchSummaryProps) {
  const store = useMarketplaceStore();

  const getSummaryText = () => {
    if (store.searchQuery) {
      return (
        <span>
          Found <span className="font-extrabold text-primary">{total}</span> {entityType} for{" "}
          <span className="font-semibold text-text-primary">&quot;{store.searchQuery}&quot;</span>
        </span>
      );
    }
    return (
      <span>
        Browsing <span className="font-extrabold text-primary">{total}</span> available {entityType}
      </span>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full text-xs text-text-secondary py-1 border-b border-border/40 pb-3">
      <div className="font-medium text-left">
        {getSummaryText()}
        {store.selectedLocation && (
          <span>
            {" "}in <span className="font-semibold text-text-primary">{store.selectedLocation}</span>
          </span>
        )}
      </div>
      <div className="text-[10px] text-text-muted font-medium bg-bg-elevated/40 px-2 py-0.5 rounded border border-border/40 shrink-0 self-start sm:self-auto">
        Search completed in 0.08s
      </div>
    </div>
  );
}
