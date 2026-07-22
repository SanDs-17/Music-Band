"use client";

import { Clock } from "lucide-react";
import { cn } from "@/utils/cn";
import type { AvailabilityStatus } from "@/features/marketplace/types";

interface MarketplaceAvailabilityBadgeProps {
  availability?: AvailabilityStatus | null;
  fallbackLabel?: string;
  className?: string;
}

export function MarketplaceAvailabilityBadge({
  availability,
  fallbackLabel = "Available",
  className,
}: MarketplaceAvailabilityBadgeProps) {
  const label = availability?.indicator_label || fallbackLabel;
  const isAvailable = availability?.is_available ?? label.toLowerCase().includes("available");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        isAvailable
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-amber-500/30 bg-amber-500/10 text-amber-400",
        className
      )}
    >
      <Clock className="h-3 w-3 shrink-0" />
      {label}
    </span>
  );
}
