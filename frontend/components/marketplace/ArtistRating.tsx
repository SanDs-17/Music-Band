"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

export interface ArtistRatingProps {
  rating: number;
  totalReviews?: number;
  showReviews?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ArtistRating({
  rating,
  totalReviews = 0,
  showReviews = true,
  size = "sm",
  className
}: ArtistRatingProps) {
  const iconSize = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  const textSize = size === "lg" ? "text-base" : size === "md" ? "text-sm" : "text-xs";

  return (
    <div className={cn("inline-flex items-center gap-1 font-bold text-text-primary", textSize, className)}>
      <Star className={cn(iconSize, "fill-amber-400 text-amber-400 shrink-0")} />
      <span>{rating.toFixed(1)}</span>
      {showReviews && (
        <span className="text-[10px] font-medium text-text-muted">({totalReviews})</span>
      )}
    </div>
  );
}
