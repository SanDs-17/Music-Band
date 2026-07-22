"use client";

import { Grid, List } from "lucide-react";
import { useMarketplaceStore } from "@/features/marketplace/stores/useMarketplaceStore";
import { MarketplaceSortSelector } from "./MarketplaceSortSelector";
import { cn } from "@/utils/cn";

export function VenueSortDropdown() {
  const venueViewMode = useMarketplaceStore((state) => state.venueViewMode);
  const setVenueViewMode = useMarketplaceStore((state) => state.setVenueViewMode);

  return (
    <div className="mb-4 flex items-center justify-between gap-4 border-b border-border/40 py-2">
      <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-bg-elevated p-0.5">
        <button
          type="button"
          onClick={() => setVenueViewMode("grid")}
          className={cn(
            "rounded-md p-1.5 transition-all duration-200",
            venueViewMode === "grid"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-text-muted hover:text-text-primary"
          )}
          title="Grid View"
        >
          <Grid className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setVenueViewMode("list")}
          className={cn(
            "rounded-md p-1.5 transition-all duration-200",
            venueViewMode === "list"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-text-muted hover:text-text-primary"
          )}
          title="List View"
        >
          <List className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="shrink-0 text-xs font-semibold text-text-muted">Sort by</span>
        <MarketplaceSortSelector />
      </div>
    </div>
  );
}
