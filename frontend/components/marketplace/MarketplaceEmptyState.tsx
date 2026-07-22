"use client";

import * as React from "react";
import { SearchX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export interface MarketplaceEmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  className?: string;
}

export function MarketplaceEmptyState({
  title = "No Marketplace Listings Found",
  description = "No approved performers or event spaces match your current search filters. Try resetting filters or choosing a different city.",
  onReset,
  className
}: MarketplaceEmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/80 rounded-3xl bg-bg-card/40 space-y-4 text-text-primary", className)}>
      <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
        <SearchX className="h-8 w-8" />
      </div>

      <div className="space-y-1 max-w-md">
        <h3 className="text-base font-extrabold text-text-primary">{title}</h3>
        <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
      </div>

      {onReset && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          className="text-xs font-bold rounded-xl border-border/80"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Clear All Search Filters
        </Button>
      )}
    </div>
  );
}
