"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { MarketplaceVenueCard } from "@/features/marketplace/types";
import { Button } from "@/components/ui/button";
import { VenueBadge } from "./VenueBadge";
import { VenueRating } from "./VenueRating";
import { VenueAvailability } from "./VenueAvailability";
import { VenueVerificationBadge } from "./VenueVerificationBadge";
import { MarketplaceSmartBadges } from "./MarketplaceSmartBadges";
import { MapPin, Eye, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";
import { useMarketplaceStore } from "@/features/marketplace/stores/useMarketplaceStore";

interface VenueDiscoveryCardProps {
  venue: MarketplaceVenueCard;
  layout?: "grid" | "list";
  className?: string;
}

export function VenueDiscoveryCard({ venue, layout = "grid", className }: VenueDiscoveryCardProps) {
  const openPreviewModal = useMarketplaceStore((state) => state.openVenuePreviewModal);
  const locationText = [venue.city, venue.state].filter(Boolean).join(", ") || venue.address;
  const fallbackImage =
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80";
  const displayImage = venue.image || fallbackImage;

  if (layout === "list") {
    return (
      <div
        className={cn(
          "group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-border/70 bg-bg-card shadow-lg hover:border-primary/40 hover:shadow-xl transition-all duration-300",
          className,
        )}
      >
        <div className="relative sm:w-72 h-48 sm:h-auto shrink-0 overflow-hidden bg-bg-elevated">
          <Image
            src={displayImage}
            alt={venue.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {venue.is_featured && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-md">
              <Sparkles className="h-3 w-3 fill-black" />
              Spotlight
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <VenueBadge venueType={venue.venue_type} capacity={venue.capacity} />
              <div className="flex items-center gap-2">
                <VenueVerificationBadge status={venue.verification_status} />
                <VenueAvailability status={venue.availability_status} />
              </div>
            </div>

            <div className="flex items-start justify-between gap-2 pt-1">
              <div>
                <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                  {venue.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-text-secondary mt-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                  <span>{locationText}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs text-text-muted">Starting from</div>
                <div className="text-lg font-black text-primary">
                  ₹
                  {venue.base_price ? venue.base_price.toLocaleString("en-IN") : "Price on Request"}
                </div>
              </div>
            </div>

            {venue.description && (
              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                {venue.description}
              </p>
            )}

            <MarketplaceSmartBadges
              searchScore={venue.search_score}
              availabilityInfo={venue.availability_info}
              popularityInfo={venue.popularity_info}
              profileCompletion={venue.profile_completion_info}
              smartBadges={venue.smart_badges}
            />

            {venue.facilities && venue.facilities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {venue.facilities.slice(0, 4).map((facility, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-secondary/20 px-2 py-0.5 text-[11px] font-medium text-text-secondary"
                  >
                    {facility}
                  </span>
                ))}
                {venue.facilities.length > 4 && (
                  <span className="text-[11px] text-text-muted self-center">
                    +{venue.facilities.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border/40 pt-3 gap-3">
            <VenueRating rating={venue.rating} totalReviews={venue.total_reviews} />

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold"
                onClick={() => openPreviewModal(venue.id)}
              >
                <Eye className="mr-1 h-3.5 w-3.5" />
                Quick View
              </Button>

              <Button asChild size="sm" className="h-8 text-xs font-semibold">
                <Link href={`/venues/${venue.id}`}>
                  <Calendar className="mr-1 h-3.5 w-3.5" />
                  Request Booking
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-bg-card shadow-lg hover:border-primary/40 hover:shadow-xl transition-all duration-300",
        className,
      )}
    >
      <div className="relative h-48 w-full overflow-hidden bg-bg-elevated">
        <Image
          src={displayImage}
          alt={venue.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {venue.is_featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-md">
              <Sparkles className="h-3 w-3 fill-black" />
              Spotlight
            </span>
          ) : (
            <div />
          )}
          <VenueVerificationBadge status={venue.verification_status} />
        </div>

        <div className="absolute bottom-3 left-3">
          <VenueAvailability status={venue.availability_status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-2">
          <VenueBadge venueType={venue.venue_type} capacity={venue.capacity} />

          <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
            {venue.name}
          </h3>

          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            <span className="truncate">{locationText}</span>
          </div>

          {venue.description && (
            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
              {venue.description}
            </p>
          )}

          <MarketplaceSmartBadges
            searchScore={venue.search_score}
            availabilityInfo={venue.availability_info}
            popularityInfo={venue.popularity_info}
            profileCompletion={venue.profile_completion_info}
            smartBadges={venue.smart_badges}
          />

          {venue.facilities && venue.facilities.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {venue.facilities.slice(0, 3).map((facility, i) => (
                <span
                  key={i}
                  className="rounded-md bg-secondary/20 px-2 py-0.5 text-[10px] font-medium text-text-secondary"
                >
                  {facility}
                </span>
              ))}
              {venue.facilities.length > 3 && (
                <span className="text-[10px] text-text-muted self-center">
                  +{venue.facilities.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between">
            <VenueRating rating={venue.rating} totalReviews={venue.total_reviews} />
            <div className="text-right">
              <span className="text-[10px] text-text-muted block">Base rate</span>
              <span className="text-sm font-black text-primary">
                ₹{venue.base_price ? venue.base_price.toLocaleString("en-IN") : "On Request"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold h-8"
              onClick={() => openPreviewModal(venue.id)}
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              Quick View
            </Button>
            <Button asChild size="sm" className="w-full text-xs font-semibold h-8">
              <Link href={`/venues/${venue.id}`}>View Space</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
