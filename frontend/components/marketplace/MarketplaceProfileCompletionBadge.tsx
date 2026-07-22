"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";
import type { ProfileCompletion } from "@/features/marketplace/types";

interface MarketplaceProfileCompletionBadgeProps {
  profileCompletion?: ProfileCompletion | null;
  className?: string;
}

export function MarketplaceProfileCompletionBadge({
  profileCompletion,
  className,
}: MarketplaceProfileCompletionBadgeProps) {
  if (!profileCompletion) return null;

  const { percentage, is_complete: isComplete } = profileCompletion;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
        isComplete
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-border/60 bg-bg-elevated text-text-muted",
        className
      )}
      title={
        profileCompletion.missing_fields.length > 0
          ? `Missing: ${profileCompletion.missing_fields.join(", ")}`
          : "Profile complete"
      }
    >
      {isComplete && <CheckCircle2 className="h-3 w-3" />}
      {percentage}% Profile
    </span>
  );
}
