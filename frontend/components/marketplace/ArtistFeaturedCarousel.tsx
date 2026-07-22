"use client";

import * as React from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { MarketplaceArtistCard } from "@/features/marketplace/types";
import { FeaturedArtistCard } from "./FeaturedArtistCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export interface ArtistFeaturedCarouselProps {
  artists: MarketplaceArtistCard[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function ArtistFeaturedCarousel({
  artists,
  title = "Featured Spotlight Performers",
  subtitle = "Handpicked top-rated music bands and artists available for direct booking",
  className
}: ArtistFeaturedCarouselProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  if (!artists || artists.length === 0) return null;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <div className={cn("space-y-4 rounded-3xl border border-border/80 bg-linear-to-r from-bg-card via-bg-elevated/20 to-bg-card p-6 shadow-xl text-text-primary", className)}>
      <div className="flex items-end justify-between border-b border-border/40 pb-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Spotlight</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-text-primary">{title}</h2>
          {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={scrollLeft}
            className="h-8 w-8 p-0 rounded-full border-border/80 text-text-muted hover:text-text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={scrollRight}
            className="h-8 w-8 p-0 rounded-full border-border/80 text-text-muted hover:text-text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-5 overflow-x-auto scrollbar-none py-2 snap-x snap-mandatory"
      >
        {artists.map((artist) => (
          <div key={artist.id} className="w-80 shrink-0 snap-start">
            <FeaturedArtistCard artist={artist} className="h-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
