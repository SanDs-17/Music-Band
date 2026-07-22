"use client";

import React from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { useMarketplaceStore } from "@/features/marketplace/stores/useMarketplaceStore";

interface MarketplaceActiveFiltersProps {
  pageType: "artist" | "venue";
}

export function MarketplaceActiveFilters({ pageType }: MarketplaceActiveFiltersProps) {
  const store = useMarketplaceStore();

  const chips: { label: string; value: string; onClear: () => void }[] = [];

  if (store.searchQuery) {
    chips.push({
      label: "Search",
      value: `"${store.searchQuery}"`,
      onClear: () => store.setSearchQuery(""),
    });
  }

  if (store.selectedCategory) {
    chips.push({
      label: "Category",
      value: store.selectedCategory,
      onClear: () => store.setSelectedCategory(""),
    });
  }

  if (store.selectedLocation) {
    chips.push({
      label: "Location",
      value: store.selectedLocation,
      onClear: () => store.setSelectedLocation(""),
    });
  }

  if (pageType === "artist") {
    if (store.artistGenreFilter) {
      chips.push({
        label: "Genre",
        value: store.artistGenreFilter,
        onClear: () => store.setArtistGenreFilter(""),
      });
    }
    if (store.minRatingFilter !== null) {
      chips.push({
        label: "Rating",
        value: `★ ${store.minRatingFilter}+`,
        onClear: () => store.setMinRatingFilter(null),
      });
    }
    if (store.verifiedOnlyFilter) {
      chips.push({
        label: "Verified",
        value: "Only Verified",
        onClear: () => store.setVerifiedOnlyFilter(false),
      });
    }
    if (store.featuredOnlyFilter) {
      chips.push({
        label: "Featured",
        value: "Featured Performers",
        onClear: () => store.setFeaturedOnlyFilter(false),
      });
    }
  } else {
    if (store.venueTypeFilter) {
      chips.push({
        label: "Venue Type",
        value: store.venueTypeFilter,
        onClear: () => store.setVenueTypeFilter(""),
      });
    }
    if (store.minCapacityFilter !== null) {
      chips.push({
        label: "Min Capacity",
        value: `${store.minCapacityFilter}+ guests`,
        onClear: () => store.setMinCapacityFilter(null),
      });
    }
    if (store.venueMinRatingFilter !== null) {
      chips.push({
        label: "Rating",
        value: `★ ${store.venueMinRatingFilter}+`,
        onClear: () => store.setVenueMinRatingFilter(null),
      });
    }
    if (store.venueVerifiedOnlyFilter) {
      chips.push({
        label: "Verified",
        value: "Only Verified",
        onClear: () => store.setVenueVerifiedOnlyFilter(false),
      });
    }
    if (store.venueFeaturedOnlyFilter) {
      chips.push({
        label: "Featured",
        value: "Spotlight Venues",
        onClear: () => store.setVenueFeaturedOnlyFilter(false),
      });
    }
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-2 px-3 bg-bg-card/60 border border-border/60 rounded-2xl w-full animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0 font-bold uppercase tracking-wider">
        <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
        <span>Active Filters ({chips.length})</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
        {chips.map((chip) => (
          <div
            key={`${chip.label}-${chip.value}`}
            className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-xl bg-bg-elevated border border-border/40 text-[11px] text-text-primary font-medium"
          >
            <span className="text-text-secondary">{chip.label}:</span>
            <span className="font-semibold text-primary truncate max-w-[120px]">{chip.value}</span>
            <button
              type="button"
              onClick={chip.onClear}
              className="p-1 rounded-lg text-text-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
              title={`Clear filter ${chip.label}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={store.resetFilters}
          className="text-xs text-primary hover:underline font-bold pl-2.5"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
