"use client";

import * as React from "react";
import { ArtistDiscoveryCard } from "./ArtistDiscoveryCard";
import { MarketplaceArtistCard } from "@/features/marketplace/types";
import { cn } from "@/utils/cn";

export interface ArtistDiscoveryGridProps {
  artists: MarketplaceArtistCard[];
  className?: string;
}

export function ArtistDiscoveryGrid({ artists, className }: ArtistDiscoveryGridProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {artists.map((artist) => (
        <ArtistDiscoveryCard key={artist.id} artist={artist} viewMode="grid" />
      ))}
    </div>
  );
}
