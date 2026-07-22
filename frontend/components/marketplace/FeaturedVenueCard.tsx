"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Users, Building2, ArrowRight } from "lucide-react";
import { MarketplaceVenueCard } from "@/features/marketplace/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

export interface FeaturedVenueCardProps {
  venue: MarketplaceVenueCard;
  className?: string;
}

export function FeaturedVenueCard({ venue, className }: FeaturedVenueCardProps) {
  return (
    <div
      className={cn(
        "group rounded-2xl border border-border/80 bg-bg-card hover:bg-bg-elevated/20 transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden flex flex-col justify-between text-text-primary",
        className,
      )}
    >
      <div>
        {/* Cover image or fallback */}
        <div className="h-36 w-full bg-bg-elevated/60 relative overflow-hidden border-b border-border/40">
          {venue.image ? (
            <Image
              src={venue.image}
              alt={venue.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-text-muted">
              <Building2 className="h-10 w-10 opacity-40" />
            </div>
          )}

          {venue.venue_type && (
            <Badge className="absolute top-3 left-3 bg-bg-card/90 backdrop-blur-md text-text-primary text-[10px] font-bold uppercase tracking-wider border border-border/60">
              {venue.venue_type}
            </Badge>
          )}
        </div>

        <div className="p-5 space-y-3">
          <h3 className="font-extrabold text-sm sm:text-base text-text-primary group-hover:text-primary transition-colors line-clamp-1">
            {venue.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">
              {venue.address}, {venue.city || venue.state}
            </span>
          </div>

          {venue.description && (
            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
              {venue.description}
            </p>
          )}

          {/* Capacity badge */}
          <div className="flex items-center gap-4 text-xs font-medium text-text-muted pt-1">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-blue-400" />
              <span>Up to {venue.capacity} guests</span>
            </div>
            {venue.base_price > 0 && (
              <span className="font-extrabold text-text-primary">
                ₹{venue.base_price.toLocaleString()}{" "}
                <span className="text-[10px] font-normal text-text-muted">/ event</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="px-5 py-3.5 bg-bg-elevated/40 border-t border-border/40 flex items-center justify-between text-xs text-text-muted mt-auto">
        <div className="flex items-center gap-1 font-bold text-text-primary">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>{venue.rating.toFixed(1)}</span>
          <span className="text-[10px] font-normal text-text-muted">({venue.total_reviews})</span>
        </div>

        <Link
          href={`/venues/${venue.id}`}
          className="inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:text-primary-hover group-hover:translate-x-0.5 transition-transform"
        >
          <span>View Space</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
