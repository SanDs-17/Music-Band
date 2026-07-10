"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingRequestDetail } from "@/types/booking";
import { formatCurrency } from "@/utils/format-currency";
import { format } from "date-fns";
import { ArrowRight, CalendarClock, CircleAlert, Clock3, Sparkles, TrendingUp } from "lucide-react";
import { BookingStatusBadge } from "./BookingStatusBadge";

interface BookingDashboardWidgetsProps {
  upcomingEvents: BookingRequestDetail[];
  recentBookings: BookingRequestDetail[];
  pendingRequests: BookingRequestDetail[];
  monthlySummary: Array<{ label: string; count: number }>;
  statusSummary: Array<{ label: string; count: number; tone: string }>;
  todaysSchedule: BookingRequestDetail[];
}

export function BookingDashboardWidgets({
  upcomingEvents,
  recentBookings,
  pendingRequests,
  monthlySummary,
  statusSummary,
  todaysSchedule,
}: BookingDashboardWidgetsProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 shadow-xl">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
            <CalendarClock className="h-4 w-4 text-primary" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/40">
          {upcomingEvents.length === 0 ? (
            <div className="p-6 text-sm text-text-secondary">No upcoming events right now.</div>
          ) : (
            upcomingEvents.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-white">{booking.event_title}</p>
                  <p className="text-[11px] text-text-muted">
                    {format(new Date(booking.event_date), "PP")} • {booking.start_time} -{" "}
                    {booking.end_time}
                  </p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 shadow-xl">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
            <Sparkles className="h-4 w-4 text-primary" />
            Recent Booking Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/40">
          {recentBookings.length === 0 ? (
            <div className="p-6 text-sm text-text-secondary">No recent activity yet.</div>
          ) : (
            recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-white">{booking.event_title}</p>
                  <p className="text-[11px] text-text-muted">
                    {booking.location} • {formatCurrency(booking.proposed_price)}
                  </p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 shadow-xl">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
            <CircleAlert className="h-4 w-4 text-primary" />
            Booking Status Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {statusSummary.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{item.label}</span>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${item.tone}`}
              >
                {item.count}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 shadow-xl">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
            <TrendingUp className="h-4 w-4 text-primary" />
            Monthly Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {monthlySummary.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{item.label}</span>
              <span className="text-sm font-semibold text-white">{item.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="xl:col-span-2 bg-bg-card/45 backdrop-blur-md border border-border/80 shadow-xl">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
            <Clock3 className="h-4 w-4 text-primary" />
            Today&apos;s Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/40">
          {todaysSchedule.length === 0 ? (
            <div className="p-6 text-sm text-text-secondary">No events scheduled today.</div>
          ) : (
            todaysSchedule.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-white">{booking.event_title}</p>
                  <p className="text-[11px] text-text-muted">
                    {booking.location} • {booking.start_time} - {booking.end_time}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-[11px] h-8 text-white">
                  View
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="xl:col-span-2 bg-bg-card/45 backdrop-blur-md border border-border/80 shadow-xl">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
            <Clock3 className="h-4 w-4 text-primary" />
            Pending Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/40">
          {pendingRequests.length === 0 ? (
            <div className="p-6 text-sm text-text-secondary">No pending requests.</div>
          ) : (
            pendingRequests.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-white">{booking.event_title}</p>
                  <p className="text-[11px] text-text-muted">
                    {format(new Date(booking.event_date), "PP")} • {booking.location}
                  </p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
