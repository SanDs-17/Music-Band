"use client";

import * as React from "react";
import { Filter, Star, CheckCircle2, RotateCcw, Sparkles, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarketplaceStore } from "@/features/marketplace/stores/useMarketplaceStore";
import { ArtistFilterOptions } from "@/features/marketplace/types";
import { cn } from "@/utils/cn";

export interface ArtistFilterSidebarProps {
  options?: ArtistFilterOptions | null;
  className?: string;
}

export function ArtistFilterSidebar({ options, className }: ArtistFilterSidebarProps) {
  const {
    artistGenreFilter,
    minRatingFilter,
    verifiedOnlyFilter,
    featuredOnlyFilter,
    setArtistGenreFilter,
    setMinRatingFilter,
    setVerifiedOnlyFilter,
    setFeaturedOnlyFilter,
    resetFilters
  } = useMarketplaceStore();

  const genres = options?.genres || ["Rock", "Pop", "Classical", "Jazz", "Folk", "EDM", "Hip-Hop", "Indie"];

  const hasActiveFilters =
    Boolean(artistGenreFilter) ||
    minRatingFilter !== null ||
    verifiedOnlyFilter ||
    featuredOnlyFilter;

  return (
    <aside
      className={cn(
        "w-full lg:w-72 bg-bg-card border border-border/80 rounded-2xl p-5 space-y-6 shadow-lg text-text-primary shrink-0 self-start",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-sm uppercase tracking-wider text-text-primary">
          <Filter className="h-4 w-4 text-primary shrink-0" />
          <span>Artist Filters</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      {/* Genre Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <Music className="h-3.5 w-3.5 text-primary" />
          <span>Music Genre</span>
        </label>
        <select
          value={artistGenreFilter}
          onChange={(e) => setArtistGenreFilter(e.target.value)}
          className="w-full h-10 px-3 text-xs bg-bg-elevated/50 border border-border/60 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        >
          <option value="" className="bg-bg-card text-text-primary">All Genres</option>
          {genres.map((g) => (
            <option key={g} value={g} className="bg-bg-card text-text-primary">
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Minimum Rating Filter */}
      <div className="space-y-2 border-t border-border/40 pt-4">
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          <span>Minimum Rating</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[4.5, 4.0, 3.5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setMinRatingFilter(minRatingFilter === val ? null : val)}
              className={cn(
                "py-1.5 px-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1",
                minRatingFilter === val
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                  : "bg-bg-elevated/40 border-border/60 text-text-secondary hover:text-text-primary"
              )}
            >
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{val}+</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles: Verified & Featured */}
      <div className="space-y-3 border-t border-border/40 pt-4">
        <label className="flex items-center justify-between cursor-pointer select-none text-xs font-semibold text-text-primary">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-400" />
            <span>Verified Performer</span>
          </div>
          <input
            type="checkbox"
            checked={verifiedOnlyFilter}
            onChange={(e) => setVerifiedOnlyFilter(e.target.checked)}
            className="rounded border-border/80 text-primary focus:ring-primary h-4 w-4"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer select-none text-xs font-semibold text-text-primary">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Featured Only</span>
          </div>
          <input
            type="checkbox"
            checked={featuredOnlyFilter}
            onChange={(e) => setFeaturedOnlyFilter(e.target.checked)}
            className="rounded border-border/80 text-primary focus:ring-primary h-4 w-4"
          />
        </label>
      </div>

      {/* Reset Action */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="w-full h-9 rounded-xl border-border/80 text-xs font-bold"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Clear All Filters
        </Button>
      )}
    </aside>
  );
}
