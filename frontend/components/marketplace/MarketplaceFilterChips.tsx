"use client";

import React from "react";
import { CheckCircle, Award, Star } from "lucide-react";
import { useMarketplaceStore } from "@/features/marketplace/stores/useMarketplaceStore";
import { cn } from "@/utils/cn";

interface MarketplaceFilterChipsProps {
  pageType: "artist" | "venue";
}

export function MarketplaceFilterChips({ pageType }: MarketplaceFilterChipsProps) {
  const store = useMarketplaceStore();

  const handleToggleVerified = () => {
    if (pageType === "artist") {
      store.setVerifiedOnlyFilter(!store.verifiedOnlyFilter);
    } else {
      store.setVenueVerifiedOnlyFilter(!store.venueVerifiedOnlyFilter);
    }
  };

  const handleToggleFeatured = () => {
    if (pageType === "artist") {
      store.setFeaturedOnlyFilter(!store.featuredOnlyFilter);
    } else {
      store.setVenueFeaturedOnlyFilter(!store.venueFeaturedOnlyFilter);
    }
  };

  const handleToggleTopRated = () => {
    if (pageType === "artist") {
      store.setMinRatingFilter(store.minRatingFilter === 4.5 ? null : 4.5);
    } else {
      store.setVenueMinRatingFilter(store.venueMinRatingFilter === 4.5 ? null : 4.5);
    }
  };

  const isVerified = pageType === "artist" ? store.verifiedOnlyFilter : store.venueVerifiedOnlyFilter;
  const isFeatured = pageType === "artist" ? store.featuredOnlyFilter : store.venueFeaturedOnlyFilter;
  const isTopRated = pageType === "artist" ? store.minRatingFilter === 4.5 : store.venueMinRatingFilter === 4.5;

  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      {/* Verified Only */}
      <button
        type="button"
        onClick={handleToggleVerified}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 select-none",
          isVerified
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
            : "bg-bg-elevated/40 border-border/60 text-text-secondary hover:text-text-primary hover:border-border"
        )}
      >
        <CheckCircle className="h-3.5 w-3.5" />
        <span>Verified</span>
      </button>

      {/* Featured Only */}
      <button
        type="button"
        onClick={handleToggleFeatured}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 select-none",
          isFeatured
            ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
            : "bg-bg-elevated/40 border-border/60 text-text-secondary hover:text-text-primary hover:border-border"
        )}
      >
        <Award className="h-3.5 w-3.5" />
        <span>Featured</span>
      </button>

      {/* Top Rated (4.5+) */}
      <button
        type="button"
        onClick={handleToggleTopRated}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 select-none",
          isTopRated
            ? "bg-primary/10 border-primary/30 text-primary"
            : "bg-bg-elevated/40 border-border/60 text-text-secondary hover:text-text-primary hover:border-border"
        )}
      >
        <Star className={cn("h-3.5 w-3.5", isTopRated ? "fill-primary text-primary" : "")} />
        <span>Top Rated (4.5+)</span>
      </button>
    </div>
  );
}
