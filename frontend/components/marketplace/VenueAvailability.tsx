"use client";

import * as React from "react";
import { CalendarCheck2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface VenueAvailabilityProps {
  status?: string;
  className?: string;
}

export function VenueAvailability({ status = "Open for booking", className }: VenueAvailabilityProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <CalendarCheck2 className="h-3 w-3" />
      <span>{status}</span>
    </div>
  );
}
