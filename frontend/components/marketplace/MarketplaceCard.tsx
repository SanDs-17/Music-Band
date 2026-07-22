"use client";

import * as React from "react";
import { FeaturedArtistCard } from "./FeaturedArtistCard";
import { FeaturedVenueCard } from "./FeaturedVenueCard";
import { MarketplaceArtistCard, MarketplaceVenueCard } from "@/features/marketplace/types";

export interface MarketplaceCardProps {
  type: "artist" | "venue";
  data: MarketplaceArtistCard | MarketplaceVenueCard;
  className?: string;
}

export function MarketplaceCard({ type, data, className }: MarketplaceCardProps) {
  if (type === "artist") {
    return <FeaturedArtistCard artist={data as MarketplaceArtistCard} className={className} />;
  }
  return <FeaturedVenueCard venue={data as MarketplaceVenueCard} className={className} />;
}
