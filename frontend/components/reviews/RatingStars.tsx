"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-4.5 w-4.5",
  lg: "h-6 w-6"
};

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const currentRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={cn("flex items-center gap-1 select-none", className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(currentRating);

        return (
          <button
            key={starValue}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            className={cn(
              "transition-transform focus:outline-none",
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-border/40 text-text-muted/60"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
