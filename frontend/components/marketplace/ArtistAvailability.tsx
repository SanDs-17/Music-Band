"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/utils/cn";

export interface ArtistAvailabilityProps {
  status?: string;
  className?: string;
}

export function ArtistAvailability({ status = "Available", className }: ArtistAvailabilityProps) {
  const isAvailable = status.toLowerCase().includes("available");

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border",
        isAvailable
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          : "bg-amber-500/10 text-amber-400 border-amber-500/30",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isAvailable ? "bg-emerald-400" : "bg-amber-400")} />
      <Clock className="h-3 w-3 shrink-0" />
      <span>{status}</span>
    </div>
  );
}
