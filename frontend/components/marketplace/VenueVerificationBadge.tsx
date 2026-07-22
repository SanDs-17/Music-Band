"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/utils/cn";

interface VenueVerificationBadgeProps {
  status?: string;
  className?: string;
}

export function VenueVerificationBadge({ status = "approved", className }: VenueVerificationBadgeProps) {
  if (status !== "approved") return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[11px] font-bold text-blue-400 border border-blue-500/25",
        className
      )}
      title="Verified Event Space"
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      <span>Verified</span>
    </span>
  );
}
