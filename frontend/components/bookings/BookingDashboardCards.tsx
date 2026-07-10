"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, CircleOff, Clock3, Sparkles } from "lucide-react";

interface BookingDashboardCardsProps {
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

export function BookingDashboardCards({
  pendingBookings,
  confirmedBookings,
  completedBookings,
  cancelledBookings,
}: BookingDashboardCardsProps) {
  const cards = [
    {
      title: "Pending Bookings",
      value: pendingBookings,
      detail: "Awaiting your response",
      icon: Clock3,
      tone: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Confirmed Bookings",
      value: confirmedBookings,
      detail: "Locked in for upcoming dates",
      icon: Sparkles,
      tone: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
      title: "Completed Bookings",
      value: completedBookings,
      detail: "Successfully delivered events",
      icon: CheckCircle2,
      tone: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Cancelled Bookings",
      value: cancelledBookings,
      detail: "Closed or declined requests",
      icon: CircleOff,
      tone: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`bg-bg-card/45 backdrop-blur-md border ${card.tone} shadow-xl`}
          >
            <CardContent className="p-4 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                  {card.title}
                </p>
                <p className="text-xl font-black text-white">{card.value}</p>
                <p className="text-[11px] text-text-muted">{card.detail}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-bg-elevated/80 p-2.5">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
