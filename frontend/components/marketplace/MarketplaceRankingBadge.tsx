"use client";

import { cn } from "@/utils/cn";
import type { SearchScore } from "@/features/marketplace/types";

interface MarketplaceRankingBadgeProps {
  searchScore?: SearchScore | null;
  className?: string;
}

export function MarketplaceRankingBadge({
  searchScore,
  className,
}: MarketplaceRankingBadgeProps) {
  if (!searchScore) return null;

  const maxScore = 205;
  const percentage = Math.min(100, Math.round((searchScore.total_score / maxScore) * 100));

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary",
        className
      )}
      title={`Match score: ${searchScore.total_score.toFixed(1)}`}
    >
      {percentage}% Match
    </span>
  );
}
