"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import * as React from "react";

interface BookingDashboardPlaceholderCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  actionLabel?: string;
  onActionClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function BookingDashboardPlaceholderCard({
  title,
  description,
  icon: Icon,
  actionLabel,
  onActionClick,
  children,
  className,
}: BookingDashboardPlaceholderCardProps) {
  return (
    <Card
      className={`bg-bg-card/45 backdrop-blur-md border border-border/80 shadow-xl ${className || ""}`}
    >
      <CardHeader className="flex flex-col gap-4 pb-4 border-b border-border/60">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-white">{title}</CardTitle>
              {description ? (
                <p className="text-xs leading-relaxed text-text-secondary">{description}</p>
              ) : null}
            </div>
          </div>
          {actionLabel ? (
            <Button size="sm" variant="outline" onClick={onActionClick}>
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-5">{children}</CardContent>
    </Card>
  );
}
