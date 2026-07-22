"use client";

import * as React from "react";
import { useFeaturedVenues } from "@/features/marketplace/hooks/useMarketplace";
import { useMarketplaceStore } from "@/features/marketplace/stores/useMarketplaceStore";
import { Sparkles, ArrowLeft, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VenueBadge } from "./VenueBadge";
import { VenueRating } from "./VenueRating";

export function VenueFeaturedCarousel() {
  const { venues, loading } = useFeaturedVenues();
  const openPreviewModal = useMarketplaceStore((state) => state.openVenuePreviewModal);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const scrollAmount = 340;
    containerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-bg-elevated rounded"></div>
        <div className="flex gap-4 overflow-hidden">
          <div className="h-72 w-80 shrink-0 bg-bg-elevated rounded-2xl"></div>
          <div className="h-72 w-80 shrink-0 bg-bg-elevated rounded-2xl"></div>
          <div className="h-72 w-80 shrink-0 bg-bg-elevated rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (venues.length === 0) return null;

  return (
    <div className="relative space-y-4 rounded-3xl bg-linear-to-r from-amber-500/5 via-transparent to-transparent p-6 border border-amber-500/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400">
            <Sparkles className="h-4 w-4 fill-amber-400/20" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-text-primary">Featured Spaces</h2>
            <p className="text-xs text-text-secondary">Explore premium event hosting venues</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            className="h-8 w-8 rounded-full bg-bg-card hover:bg-bg-elevated"
            title="Scroll Left"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            className="h-8 w-8 rounded-full bg-bg-card hover:bg-bg-elevated"
            title="Scroll Right"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex gap-5 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory"
      >
        {venues.map((venue) => {
          const displayImage = venue.image || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80";
          return (
            <div
              key={venue.id}
              className="relative w-80 shrink-0 snap-start overflow-hidden rounded-2xl border border-border/80 bg-bg-card shadow-md hover:border-amber-500/30 transition-all duration-300 group"
            >
              <div className="relative h-40 w-full overflow-hidden bg-bg-elevated">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayImage}
                  alt={venue.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-black shadow-md">
                  Spotlight
                </span>

                <div className="absolute top-3 right-3">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7 rounded-full bg-bg-card/90 backdrop-blur-md hover:bg-bg-elevated border border-border/40"
                    onClick={() => openPreviewModal(venue.id)}
                    title="Quick Preview"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <VenueBadge venueType={venue.venue_type} capacity={venue.capacity} />
                <h3 className="font-bold text-sm text-text-primary line-clamp-1 leading-snug">
                  {venue.name}
                </h3>
                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <VenueRating rating={venue.rating} totalReviews={venue.total_reviews} />
                  <span className="text-xs font-black text-primary">
                    ₹{venue.base_price ? venue.base_price.toLocaleString("en-IN") : "Request"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
