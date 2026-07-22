"use client";

import * as React from "react";
import { MarketplaceVenueCard } from "@/features/marketplace/types";
import { VenueDiscoveryCard } from "./VenueDiscoveryCard";

interface VenueDiscoveryListProps {
  venues: MarketplaceVenueCard[];
}

export function VenueDiscoveryList({ venues }: VenueDiscoveryListProps) {
  return (
    <div className="space-y-4 flex flex-col">
      {venues.map((venue) => (
        <VenueDiscoveryCard key={venue.id} venue={venue} layout="list" />
      ))}
    </div>
  );
}
