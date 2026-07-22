"use client";

import { Star, TrendingUp, CalendarCheck } from "lucide-react";
import { cn } from "@/utils/cn";
import type { PopularityMetrics, SmartBadge } from "@/features/marketplace/types";

interface MarketplacePopularityBadgeProps {
  popularity?: PopularityMetrics | null;
  smartBadges?: SmartBadge[];
  className?: string;
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  top_rated: <Star className="h-3 w-3" />,
  popular: <TrendingUp className="h-3 w-3" />,
  highly_booked: <CalendarCheck className="h-3 w-3" />,
};

const VARIANT_CLASSES: Record<string, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  purple: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  primary: "border-primary/30 bg-primary/10 text-primary",
  default: "border-border/60 bg-bg-elevated text-text-muted",
};

export function MarketplacePopularityBadge({
  popularity,
  smartBadges = [],
  className,
}: MarketplacePopularityBadgeProps) {
  const popularityBadges = smartBadges.filter((b) =>
    ["top_rated", "popular", "highly_booked"].includes(b.key)
  );

  if (popularityBadges.length === 0 && !popularity) return null;

  if (popularityBadges.length > 0) {
    return (
      <div className={cn("flex flex-wrap gap-1.5", className)}>
        {popularityBadges.map((badge) => (
          <span
            key={badge.key}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              VARIANT_CLASSES[badge.variant] || VARIANT_CLASSES.default
            )}
          >
            {BADGE_ICONS[badge.key]}
            {badge.label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary",
        className
      )}
    >
      <TrendingUp className="h-3 w-3" />
      {popularity?.popularity_level}
    </span>
  );
}
