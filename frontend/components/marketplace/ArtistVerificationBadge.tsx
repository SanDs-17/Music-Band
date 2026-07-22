"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";

export interface ArtistVerificationBadgeProps {
  status?: string;
  className?: string;
}

export function ArtistVerificationBadge({ status = "approved", className }: ArtistVerificationBadgeProps) {
  if (status !== "approved") return null;

  return (
    <div
      className={cn("inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider", className)}
      title="Verified BandConnect Performer"
    >
      <CheckCircle2 className="h-3 w-3 shrink-0" />
      <span>Verified</span>
    </div>
  );
}
