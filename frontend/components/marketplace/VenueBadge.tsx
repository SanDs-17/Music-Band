"use client";

import * as React from "react";
import { Building2, Users } from "lucide-react";
import { cn } from "@/utils/cn";

interface VenueBadgeProps {
  venueType?: string | null;
  capacity?: number;
  className?: string;
}

export function VenueBadge({ venueType, capacity, className }: VenueBadgeProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-xs font-medium text-text-secondary", className)}>
      {venueType && (
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-blue-400 border border-blue-500/20">
          <Building2 className="h-3 w-3" />
          {venueType}
        </span>
      )}
      {capacity !== undefined && capacity > 0 && (
        <span className="inline-flex items-center gap-1 rounded-md bg-secondary/20 px-2 py-0.5 text-text-muted">
          <Users className="h-3 w-3" />
          Up to {capacity.toLocaleString()} guests
        </span>
      )}
    </div>
  );
}
