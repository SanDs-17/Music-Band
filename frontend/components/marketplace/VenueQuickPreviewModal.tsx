"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useVenuePreview,
  useMarketplaceAvailability,
  useMarketplacePopularity,
  useProfileCompletion,
} from "@/features/marketplace/hooks/useMarketplace";
import { useMarketplaceStore } from "@/features/marketplace/stores/useMarketplaceStore";
import { MarketplaceSmartBadges } from "./MarketplaceSmartBadges";
import { Button } from "@/components/ui/button";
import { X, Calendar, MapPin, Sparkles, Building2, Users } from "lucide-react";
import { VenueRating } from "./VenueRating";
import { VenueAvailability } from "./VenueAvailability";
import { VenueVerificationBadge } from "./VenueVerificationBadge";

export function VenueQuickPreviewModal() {
  const selectedVenueId = useMarketplaceStore((state) => state.selectedVenuePreviewId);
  const closePreviewModal = useMarketplaceStore((state) => state.closeVenuePreviewModal);
  const { preview, loading } = useVenuePreview(selectedVenueId);
  const { data: availabilityData } = useMarketplaceAvailability("venue", selectedVenueId);
  const { data: popularityData } = useMarketplacePopularity("venue", selectedVenueId);
  const { data: profileData } = useProfileCompletion("venue", selectedVenueId);

  // Close on ESC key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreviewModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closePreviewModal]);

  if (!selectedVenueId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={closePreviewModal}
      />

      {/* Modal Card container */}
      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-border/80 bg-bg-card shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
        <button
          onClick={closePreviewModal}
          className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-all border border-white/20"
          title="Close Modal"
        >
          <X className="h-4 w-4" />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 space-y-3 animate-pulse bg-bg-card">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm font-semibold text-text-secondary">
              Loading space overview...
            </span>
          </div>
        ) : preview ? (
          <div className="flex flex-col md:flex-row max-h-[85vh] overflow-y-auto">
            {/* Gallery / Image side */}
            <div className="relative md:w-1/2 h-56 md:h-auto min-h-[250px] bg-bg-elevated">
              <Image
                src={
                  preview.image ||
                  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80"
                }
                alt={preview.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                {preview.is_featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-md">
                    <Sparkles className="h-3 w-3 fill-black" />
                    Spotlight
                  </span>
                )}
                <VenueVerificationBadge status={preview.verification_status} />
              </div>
              <div className="absolute bottom-4 left-4">
                <VenueAvailability status={preview.availability_indicator} />
              </div>
            </div>

            {/* Content info side */}
            <div className="flex-1 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-text-primary leading-tight">
                    {preview.name}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                    <span>
                      {preview.city}, {preview.state}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary bg-bg-elevated px-2.5 py-1.5 rounded-lg border border-border/40">
                    <Building2 className="h-4 w-4 text-blue-400" />
                    <span>{preview.venue_type || "Event Space"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary bg-bg-elevated px-2.5 py-1.5 rounded-lg border border-border/40">
                    <Users className="h-4 w-4 text-emerald-400" />
                    <span>Up to {preview.capacity} guests</span>
                  </div>
                </div>

                <MarketplaceSmartBadges
                  availabilityInfo={availabilityData?.availability}
                  popularityInfo={popularityData}
                  profileCompletion={profileData}
                />

                {preview.description && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      About the Space
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-4">
                      {preview.description}
                    </p>
                  </div>
                )}

                {preview.facilities && preview.facilities.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      Amenities Included
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {preview.facilities.map((fac, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-secondary/20 px-2 py-0.5 text-[10px] font-bold text-text-secondary border border-border/40"
                        >
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-4">
                <div>
                  <VenueRating rating={preview.rating} totalReviews={preview.total_reviews} />
                  <div className="mt-1">
                    <span className="text-[10px] text-text-muted block font-semibold leading-none">
                      Starting from
                    </span>
                    <span className="text-xl font-black text-primary">
                      ₹{preview.base_price ? preview.base_price.toLocaleString("en-IN") : "Request"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="h-9 px-4 text-xs font-bold"
                    onClick={closePreviewModal}
                  >
                    <Link href={`/venues/${preview.id}`}>
                      <Calendar className="mr-1.5 h-3.5 w-3.5" />
                      Book Now
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 space-y-2 bg-bg-card">
            <span className="text-sm font-semibold text-text-muted">
              Failed to retrieve venue details.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
