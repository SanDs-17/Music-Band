"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { usePopularSearches } from "@/features/marketplace/hooks/useMarketplace";

interface MarketplacePopularSearchesProps {
  onSelect: (query: string) => void;
}

export function MarketplacePopularSearches({ onSelect }: MarketplacePopularSearchesProps) {
  const { items, loading } = usePopularSearches();

  if (loading || items.length === 0) return null;

  return (
    <div className="space-y-2.5 p-3.5 bg-bg-card border border-border/60 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
        <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
        <span>Trending Searches</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onSelect(item.query)}
            className="px-3.5 py-1.5 rounded-xl bg-bg-elevated/40 hover:bg-primary/10 hover:text-primary transition-all border border-border/40 text-xs font-semibold text-text-primary hover:border-primary/30"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
