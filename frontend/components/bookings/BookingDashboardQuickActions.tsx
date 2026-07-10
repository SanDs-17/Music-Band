"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, CalendarRange, History, PlusCircle, Sparkles } from "lucide-react";

interface BookingDashboardQuickActionsProps {
  onNewBooking?: () => void;
  onViewCalendar?: () => void;
  onViewHistory?: () => void;
  onViewReports?: () => void;
}

export function BookingDashboardQuickActions({
  onNewBooking,
  onViewCalendar,
  onViewHistory,
  onViewReports,
}: BookingDashboardQuickActionsProps) {
  const actions = [
    {
      label: "New Booking",
      description: "Create a new request",
      icon: PlusCircle,
      onClick: onNewBooking,
    },
    {
      label: "Calendar",
      description: "Open booking calendar",
      icon: CalendarRange,
      onClick: onViewCalendar,
    },
    {
      label: "Booking History",
      description: "Browse recent requests",
      icon: History,
      onClick: onViewHistory,
    },
    {
      label: "Reports",
      description: "Review booking summaries",
      icon: BarChart3,
      onClick: onViewReports,
    },
  ];

  return (
    <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 shadow-xl">
      <CardHeader className="border-b border-border/60">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
          <Sparkles className="h-4 w-4 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="outline"
              onClick={action.onClick}
              className="h-auto justify-start gap-3 border-border/60 bg-bg-elevated/70 px-4 py-3"
            >
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-left">
                <span className="block text-sm font-semibold text-white">{action.label}</span>
                <span className="block text-[11px] text-text-secondary">{action.description}</span>
              </span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
