"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export interface MarketplaceErrorProps {
  error?: string;
  onRetry?: () => void;
  className?: string;
}

export function MarketplaceError({
  error = "Failed to load marketplace content.",
  onRetry,
  className
}: MarketplaceErrorProps) {
  return (
    <div className={cn("p-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs text-center space-y-3 max-w-lg mx-auto", className)}>
      <AlertCircle className="h-8 w-8 mx-auto shrink-0" />
      <div className="space-y-1">
        <h4 className="font-extrabold text-sm text-rose-300">Discovery Error</h4>
        <p className="text-rose-400">{error}</p>
      </div>

      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="text-xs font-bold border-rose-500/40 text-rose-300 hover:bg-rose-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Retry Connection
        </Button>
      )}
    </div>
  );
}
