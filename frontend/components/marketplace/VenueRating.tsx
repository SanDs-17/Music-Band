"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

interface VenueRatingProps {
  rating: number;
  totalReviews: number;
  showReviews?: boolean;
  className?: string;
}

export function VenueRating({
  rating,
  totalReviews,
  showReviews = true,
  className
}: VenueRatingProps) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary", className)}>
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
      <span>{rating > 0 ? rating.toFixed(1) : "New"}</span>
      {showReviews && (
        <span className="text-text-muted font-normal">
          ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
}
