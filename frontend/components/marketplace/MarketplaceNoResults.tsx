"use client";

import React from "react";
import { SearchX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarketplaceStore } from "@/features/marketplace/stores/useMarketplaceStore";
import { MarketplacePopularSearches } from "./MarketplacePopularSearches";

interface MarketplaceNoResultsProps {
  onReset: () => void;
}

export function MarketplaceNoResults({ onReset }: MarketplaceNoResultsProps) {
  const store = useMarketplaceStore();

  const handleSuggestionSelect = (query: string) => {
    store.setSearchQuery(query);
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive shadow-sm">
        <SearchX className="h-10 w-10 shrink-0" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-black text-text-primary tracking-tight">
          No Results Match Your Search
        </h3>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          We couldn&apos;t find any listings matching <span className="font-semibold text-text-primary">&quot;{store.searchQuery || "your filter combination"}&quot;</span>. Try adjusting your query or filters.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={onReset}
          className="h-10 px-5 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/10 text-xs shrink-0 flex items-center gap-2"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Search & Filters</span>
        </Button>
      </div>

      <div className="w-full pt-6 border-t border-border/40">
        <MarketplacePopularSearches onSelect={handleSuggestionSelect} />
      </div>
    </div>
  );
}
