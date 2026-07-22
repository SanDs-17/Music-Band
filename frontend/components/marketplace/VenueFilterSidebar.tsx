"use client";

import * as React from "react";
import { useVenueFilterOptions } from "@/features/marketplace/hooks/useMarketplace";
import { useMarketplaceStore } from "@/features/marketplace/stores/useMarketplaceStore";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Sparkles, FilterX, Users } from "lucide-react";
import { cn } from "@/utils/cn";

export function VenueFilterSidebar() {
  const { options, loading } = useVenueFilterOptions();

  const venueTypeFilter = useMarketplaceStore((state) => state.venueTypeFilter);
  const venueCityFilter = useMarketplaceStore((state) => state.venueCityFilter);
  const venueStateFilter = useMarketplaceStore((state) => state.venueStateFilter);
  const minCapacityFilter = useMarketplaceStore((state) => state.minCapacityFilter);
  const venueVerifiedOnlyFilter = useMarketplaceStore((state) => state.venueVerifiedOnlyFilter);
  const venueFeaturedOnlyFilter = useMarketplaceStore((state) => state.venueFeaturedOnlyFilter);

  const setVenueTypeFilter = useMarketplaceStore((state) => state.setVenueTypeFilter);
  const setVenueCityFilter = useMarketplaceStore((state) => state.setVenueCityFilter);
  const setVenueStateFilter = useMarketplaceStore((state) => state.setVenueStateFilter);
  const setMinCapacityFilter = useMarketplaceStore((state) => state.setMinCapacityFilter);
  const setVenueVerifiedOnlyFilter = useMarketplaceStore((state) => state.setVenueVerifiedOnlyFilter);
  const setVenueFeaturedOnlyFilter = useMarketplaceStore((state) => state.setVenueFeaturedOnlyFilter);
  const resetFilters = useMarketplaceStore((state) => state.resetFilters);

  const hasActiveFilters =
    venueTypeFilter ||
    venueCityFilter ||
    venueStateFilter ||
    minCapacityFilter ||
    venueVerifiedOnlyFilter ||
    venueFeaturedOnlyFilter;

  if (loading) {
    return (
      <div className="space-y-6 rounded-2xl border border-border/60 bg-bg-card p-6 animate-pulse">
        <div className="h-6 w-24 bg-bg-elevated rounded"></div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-bg-elevated rounded"></div>
          <div className="h-10 w-full bg-bg-elevated rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-bg-elevated rounded"></div>
          <div className="h-10 w-full bg-bg-elevated rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border/70 bg-bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-text-primary">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 px-2 text-xs font-semibold text-text-muted hover:text-primary gap-1"
          >
            <FilterX className="h-3.5 w-3.5" />
            Reset All
          </Button>
        )}
      </div>

      {/* Venue Type Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Venue Type</label>
        <select
          value={venueTypeFilter}
          onChange={(e) => setVenueTypeFilter(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-border/80 bg-bg-elevated text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50"
        >
          <option value="">All Venue Types</option>
          {options?.venue_types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Location Filters */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted">City</label>
          <select
            value={venueCityFilter}
            onChange={(e) => setVenueCityFilter(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border/80 bg-bg-elevated text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50"
          >
            <option value="">All Cities</option>
            {options?.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted">State</label>
          <select
            value={venueStateFilter}
            onChange={(e) => setVenueStateFilter(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border/80 bg-bg-elevated text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50"
          >
            <option value="">All States</option>
            {options?.states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Guest Capacity Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Minimum Capacity</label>
        <div className="grid grid-cols-1 gap-1.5">
          {options?.capacity_ranges.map((range) => {
            const isSelected = minCapacityFilter === range.value;
            return (
              <button
                key={range.value}
                onClick={() => setMinCapacityFilter(isSelected ? null : range.value)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 text-xs font-semibold rounded-lg border text-left transition-all duration-200",
                  isSelected
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/60 bg-bg-elevated/40 text-text-secondary hover:bg-bg-elevated"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-text-muted" />
                  {range.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Badges Checkboxes */}
      <div className="pt-2 border-t border-border/40 space-y-3">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={venueVerifiedOnlyFilter}
            onChange={(e) => setVenueVerifiedOnlyFilter(e.target.checked)}
            className="rounded border-border/80 text-primary focus:ring-primary/30 h-4 w-4 bg-bg-elevated"
          />
          <span className="flex items-center gap-1 text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            Verified Space Only
          </span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={venueFeaturedOnlyFilter}
            onChange={(e) => setVenueFeaturedOnlyFilter(e.target.checked)}
            className="rounded border-border/80 text-primary focus:ring-primary/30 h-4 w-4 bg-bg-elevated"
          />
          <span className="flex items-center gap-1 text-xs font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
            <Sparkles className="h-4 w-4 text-amber-400 fill-amber-400/20" />
            Spotlight Featured
          </span>
        </label>
      </div>
    </div>
  );
}
