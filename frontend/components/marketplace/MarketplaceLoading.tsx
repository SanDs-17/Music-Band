"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export interface MarketplaceLoadingProps {
  message?: string;
  count?: number;
  className?: string;
}

export function MarketplaceLoading({
  message = "Loading marketplace discovery feed...",
  count = 6,
  className
}: MarketplaceLoadingProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-center p-6 text-xs text-text-muted gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>{message}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="h-64 rounded-2xl border border-border/40 bg-bg-card/40 animate-pulse p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-bg-elevated/80" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 bg-bg-elevated/80 rounded-md" />
                <div className="h-3 w-1/2 bg-bg-elevated/60 rounded-md" />
              </div>
            </div>
            <div className="h-12 w-full bg-bg-elevated/50 rounded-xl" />
            <div className="h-8 w-full bg-bg-elevated/40 rounded-lg mt-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
