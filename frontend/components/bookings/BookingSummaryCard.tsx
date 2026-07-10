"use client";

import * as React from "react";
import { BookingRequestDetail } from "@/types/booking";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Sparkles, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/format-currency";

interface BookingSummaryCardProps {
  booking: BookingRequestDetail;
  className?: string;
}

export function BookingSummaryCard({ booking, className }: BookingSummaryCardProps) {
  return (
    <Card className={`bg-bg-card border border-border/80 rounded-2xl shadow-md p-6 ${className || ""}`}>
      <div className="flex flex-col gap-4">
        {/* Header line */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {booking.event_type}
            </span>
            <h3 className="text-base font-extrabold text-white tracking-tight line-clamp-1">
              {booking.event_title}
            </h3>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        {/* Date and pricing block */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
          <div className="space-y-1">
            <span className="text-[10px] text-text-muted flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Date
            </span>
            <p className="text-xs font-bold text-white">
              {format(new Date(booking.event_date), "PP")}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-text-muted flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Duration
            </span>
            <p className="text-xs font-bold text-white">
              {booking.start_time} - {booking.end_time} ({booking.duration} hrs)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
          <div className="space-y-1 col-span-2">
            <span className="text-[10px] text-text-muted flex items-center gap-1">
              <IndianRupee className="h-3 w-3" />
              Proposed Budget
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-white font-heading">
                {formatCurrency(booking.proposed_price)}
              </span>
              {booking.counter_price && (
                <span className="text-xs font-medium text-blue-400 line-through">
                  Counter: {formatCurrency(booking.counter_price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
