"use client";

import { bookingService } from "@/services/bookingService";
import { BookingRequestDetail } from "@/types/booking";
import { format, startOfDay } from "date-fns";
import * as React from "react";

export interface BookingDashboardSummary {
  totalBookings: number;
  pendingBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  revenuePlaceholder: number;
  monthlySummary: Array<{ label: string; count: number }>;
  statusSummary: Array<{ label: string; count: number; tone: string }>;
  recentBookings: BookingRequestDetail[];
  pendingRequests: BookingRequestDetail[];
  upcomingEvents: BookingRequestDetail[];
  todaysSchedule: BookingRequestDetail[];
}

export function useBookingDashboard() {
  const [bookings, setBookings] = React.useState<BookingRequestDetail[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchBookings = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getArtistBookings({ page: 1, limit: 100 });
      setBookings(data.bookings || []);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message || "Failed to load booking dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const summary = React.useMemo<BookingDashboardSummary>(() => {
    const today = startOfDay(new Date());
    const todayKey = format(today, "yyyy-MM-dd");

    const normalized = bookings.map((booking) => ({
      ...booking,
      statusLower: booking.status.toLowerCase(),
    }));

    const pendingBookings = normalized.filter((booking) =>
      ["pending", "under_review", "negotiation"].includes(booking.statusLower),
    );
    const upcomingBookings = normalized.filter((booking) => {
      const bookingDate = new Date(booking.event_date);
      return (
        bookingDate >= today && ["accepted", "confirmed", "upcoming"].includes(booking.statusLower)
      );
    });
    const completedBookings = normalized.filter((booking) => booking.statusLower === "completed");
    const cancelledBookings = normalized.filter((booking) =>
      ["cancelled", "rejected"].includes(booking.statusLower),
    );
    const revenuePlaceholder = completedBookings.reduce(
      (sum, booking) => sum + booking.proposed_price,
      0,
    );

    const monthlySummary = Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1);
      const label = format(monthDate, "MMM");
      const monthKey = format(monthDate, "MMM yyyy");
      const count = normalized.filter(
        (booking) => format(new Date(booking.event_date), "MMM yyyy") === monthKey,
      ).length;
      return { label, count };
    });

    const statusSummary = [
      {
        label: "Pending",
        count: pendingBookings.length,
        tone: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      },
      {
        label: "Negotiation",
        count: normalized.filter((booking) => booking.statusLower === "negotiation").length,
        tone: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      },
      {
        label: "Accepted",
        count: normalized.filter((booking) => booking.statusLower === "accepted").length,
        tone: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      },
      {
        label: "Completed",
        count: completedBookings.length,
        tone: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      },
      {
        label: "Cancelled",
        count: cancelledBookings.length,
        tone: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      },
    ];

    const recentBookings = [...normalized]
      .sort(
        (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
      )
      .slice(0, 6);

    const pendingRequests = pendingBookings.slice(0, 6);
    const upcomingEvents = upcomingBookings.slice(0, 5);
    const todaysSchedule = normalized
      .filter(
        (booking) =>
          booking.event_date === todayKey &&
          ["accepted", "confirmed", "upcoming"].includes(booking.statusLower),
      )
      .slice(0, 5);

    return {
      totalBookings: normalized.length,
      pendingBookings: pendingBookings.length,
      upcomingBookings: upcomingBookings.length,
      completedBookings: completedBookings.length,
      cancelledBookings: cancelledBookings.length,
      revenuePlaceholder,
      monthlySummary,
      statusSummary,
      recentBookings,
      pendingRequests,
      upcomingEvents,
      todaysSchedule,
    };
  }, [bookings]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    summary,
  };
}
