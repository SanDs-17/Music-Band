"use client";

import * as React from "react";
import { MarketplaceVenueCard } from "@/features/marketplace/types";
import { VenueDiscoveryCard } from "./VenueDiscoveryCard";

interface VenueDiscoveryGridProps {
  venues: MarketplaceVenueCard[];
}

export function VenueDiscoveryGrid({ venues }: VenueDiscoveryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {venues.map((venue) => (
        <VenueDiscoveryCard key={venue.id} venue={venue} layout="grid" />
      ))}
    </div>
  );
}
