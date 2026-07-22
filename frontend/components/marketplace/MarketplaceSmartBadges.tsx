"use client";

import type { SmartBadge } from "@/features/marketplace/types";
import { cn } from "@/utils/cn";
import { MarketplaceRankingBadge } from "./MarketplaceRankingBadge";
import { MarketplaceAvailabilityBadge } from "./MarketplaceAvailabilityBadge";
import { MarketplacePopularityBadge } from "./MarketplacePopularityBadge";
import { MarketplaceProfileCompletionBadge } from "./MarketplaceProfileCompletionBadge";
import type {
  SearchScore,
  AvailabilityStatus,
  PopularityMetrics,
  ProfileCompletion,
} from "@/features/marketplace/types";

interface MarketplaceSmartBadgesProps {
  searchScore?: SearchScore | null;
  availabilityInfo?: AvailabilityStatus | null;
  popularityInfo?: PopularityMetrics | null;
  profileCompletion?: ProfileCompletion | null;
  smartBadges?: SmartBadge[];
  className?: string;
}

const VARIANT_CLASSES: Record<string, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  purple: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  primary: "border-primary/30 bg-primary/10 text-primary",
  default: "border-border/60 bg-bg-elevated text-text-muted",
};

export function MarketplaceSmartBadges({
  searchScore,
  availabilityInfo,
  popularityInfo,
  profileCompletion,
  smartBadges = [],
  className,
}: MarketplaceSmartBadgesProps) {
  const genericBadges = smartBadges.filter(
    (b) => !["top_rated", "popular", "highly_booked", "available_today", "available_soon"].includes(b.key)
  );

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <MarketplaceRankingBadge searchScore={searchScore} />
      <MarketplaceAvailabilityBadge availability={availabilityInfo} />
      <MarketplacePopularityBadge popularity={popularityInfo} smartBadges={smartBadges} />
      <MarketplaceProfileCompletionBadge profileCompletion={profileCompletion} />

      {genericBadges.map((badge) => (
        <span
          key={badge.key}
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            VARIANT_CLASSES[badge.variant] || VARIANT_CLASSES.default
          )}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
