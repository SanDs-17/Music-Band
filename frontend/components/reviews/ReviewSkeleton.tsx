"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

interface ReviewSkeletonProps {
  count?: number;
  className?: string;
}

export function ReviewSkeleton({ count = 3, className }: ReviewSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-border/60 bg-bg-card p-5 space-y-3 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-border/40" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 rounded bg-border/40" />
                <div className="h-3 w-16 rounded bg-border/30" />
              </div>
            </div>
            <div className="h-5 w-20 rounded-full bg-border/40" />
          </div>
          <div className="h-4 w-3/4 rounded bg-border/40" />
          <div className="h-12 w-full rounded bg-border/30" />
        </div>
      ))}
    </div>
  );
}
