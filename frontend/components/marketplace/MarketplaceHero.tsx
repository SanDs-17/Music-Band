"use client";

import * as React from "react";
import { MarketplaceSearchBar } from "./MarketplaceSearchBar";
import { CategoryBrief, LocationGroup } from "@/features/marketplace/types";
import { Sparkles, Music2, Building2 } from "lucide-react";
import { cn } from "@/utils/cn";

export interface MarketplaceHeroProps {
  title?: string;
  subtitle?: string;
  categories?: CategoryBrief[];
  locations?: LocationGroup | null;
  onSearch?: () => void;
  className?: string;
}

export function MarketplaceHero({
  title = "Book the Perfect Artist for Every Event",
  subtitle = "Discover verified artists, live bands, DJs, and performers for weddings, corporate events, birthdays, concerts, and private celebrations—all in one place.",
  categories,
  locations,
  onSearch,
  className
}: MarketplaceHeroProps) {
  return (
    <section
      className={cn(
        "relative rounded-3xl border border-border/70 bg-linear-to-br from-bg-card via-bg-card to-bg-elevated/40 p-8 sm:p-12 shadow-2xl overflow-hidden text-text-primary",
        className
      )}
    >
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>✨ India&apos;s Trusted Live Entertainment Marketplace</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-text-primary">
          {title}
        </h1>

        <p className="text-xs sm:text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* Feature Badges */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-text-muted font-medium pt-2">
          <div className="flex items-center gap-1.5">
            <Music2 className="h-4 w-4 text-emerald-400" />
            <span>Verified Bands & Solo Acts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-blue-400" />
            <span>Curated Event Spaces</span>
          </div>
        </div>

        {/* Embed Search Bar */}
        <div className="pt-4">
          <MarketplaceSearchBar categories={categories} locations={locations} onSearch={onSearch} />
        </div>
      </div>
    </section>
  );
}
