"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";

export interface MarketplaceSectionProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllText?: string;
  children: React.ReactNode;
  className?: string;
}

export function MarketplaceSection({
  title,
  subtitle,
  viewAllHref,
  viewAllText = "View All",
  children,
  className
}: MarketplaceSectionProps) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border/40 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">{subtitle}</p>
          )}
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors shrink-0"
          >
            <span>{viewAllText}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {children}
    </section>
  );
}
