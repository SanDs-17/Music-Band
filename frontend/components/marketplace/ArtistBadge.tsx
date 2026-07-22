"use client";

import * as React from "react";
import { Users, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

export interface ArtistBadgeProps {
  bandType: string;
  totalMembers?: number;
  className?: string;
}

export function ArtistBadge({ bandType, totalMembers = 1, className }: ArtistBadgeProps) {
  const isSolo = bandType.toLowerCase() === "solo";

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 border shrink-0 flex items-center gap-1",
        isSolo
          ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
          : "border-blue-500/30 text-blue-400 bg-blue-500/10",
        className
      )}
    >
      {isSolo ? <User className="h-3 w-3 shrink-0" /> : <Users className="h-3 w-3 shrink-0" />}
      <span>{bandType} ({totalMembers} {totalMembers === 1 ? "Member" : "Members"})</span>
    </Badge>
  );
}
