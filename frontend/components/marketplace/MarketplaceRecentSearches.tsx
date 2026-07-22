"use client";

import React from "react";
import { History, X } from "lucide-react";
import { useRecentSearches } from "@/features/marketplace/hooks/useMarketplace";

interface MarketplaceRecentSearchesProps {
  onSelect: (query: string) => void;
}

export function MarketplaceRecentSearches({ onSelect }: MarketplaceRecentSearchesProps) {
  const { recentSearches, removeRecentSearch, clearRecentSearches } = useRecentSearches();

  if (recentSearches.length === 0) return null;

  return (
    <div className="space-y-2.5 p-3.5 bg-bg-card border border-border/60 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
          <History className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>Recent Searches</span>
        </div>
        <button
          type="button"
          onClick={clearRecentSearches}
          className="text-[10px] text-primary hover:underline font-bold"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {recentSearches.map((item) => (
          <div
            key={item}
            className="flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-xl bg-bg-elevated/80 hover:bg-bg-elevated transition-colors border border-border/40 text-xs text-text-primary group"
          >
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="font-medium hover:text-primary transition-colors text-left"
            >
              {item}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeRecentSearch(item);
              }}
              className="p-1 rounded-lg text-text-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
              title={`Remove ${item}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
