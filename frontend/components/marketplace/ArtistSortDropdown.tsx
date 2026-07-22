"use client";

import * as React from "react";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarketplaceStore } from "@/features/marketplace/stores/useMarketplaceStore";
import { MarketplaceSortSelector } from "./MarketplaceSortSelector";
import { cn } from "@/utils/cn";

export interface ArtistSortDropdownProps {
  className?: string;
}

export function ArtistSortDropdown({ className }: ArtistSortDropdownProps) {
  const { viewMode, setViewMode } = useMarketplaceStore();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <MarketplaceSortSelector />

      <div className="flex items-center rounded-xl border border-border/70 bg-bg-card p-0.5 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setViewMode("grid")}
          className={cn(
            "h-8 rounded-lg px-2.5 text-xs font-bold transition-colors",
            viewMode === "grid"
              ? "bg-primary text-white hover:bg-primary"
              : "text-text-muted hover:text-text-primary"
          )}
          title="Grid View"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setViewMode("list")}
          className={cn(
            "h-8 rounded-lg px-2.5 text-xs font-bold transition-colors",
            viewMode === "list"
              ? "bg-primary text-white hover:bg-primary"
              : "text-text-muted hover:text-text-primary"
          )}
          title="List View"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
