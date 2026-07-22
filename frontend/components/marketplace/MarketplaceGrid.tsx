"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

export interface MarketplaceGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MarketplaceGrid({ children, columns = 3, className }: MarketplaceGridProps) {
  const colClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return <div className={cn("grid gap-6", colClass, className)}>{children}</div>;
}
