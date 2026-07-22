"use client";

import * as React from "react";
import { ArtistDiscoveryCard } from "./ArtistDiscoveryCard";
import { MarketplaceArtistCard } from "@/features/marketplace/types";
import { cn } from "@/utils/cn";

export interface ArtistDiscoveryListProps {
  artists: MarketplaceArtistCard[];
  className?: string;
}

export function ArtistDiscoveryList({ artists, className }: ArtistDiscoveryListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {artists.map((artist) => (
        <ArtistDiscoveryCard key={artist.id} artist={artist} viewMode="list" />
      ))}
    </div>
  );
}
