"use client";

import * as React from "react";
import { bookingService } from "@/services/bookingService";
import { BookingRequestDetail } from "@/types/booking";
import { BookingHistoryTable } from "@/components/bookings/BookingHistoryTable";
import { BookingDetailsDialog } from "@/components/bookings/BookingDetailsDialog";
import { BookingRequestForm } from "@/components/bookings/BookingRequestForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarRange, Search, Plus, Filter, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ClientBookingsPage() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = React.useState<BookingRequestDetail[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters & Pagination
  const [status, setStatus] = React.useState<string>("");
  const [search, setSearch] = React.useState<string>("");
  const [page, setPage] = React.useState<number>(1);
  const limit = 10;

  // Modals state
  const [selectedBookingId, setSelectedBookingId] = React.useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState<boolean>(false);
  const [formOpen, setFormOpen] = React.useState<boolean>(false);
  const [prefilledIntent, setPrefilledIntent] = React.useState<{
    artistProfileId?: string;
    venueId?: string;
    artistName?: string;
    venueName?: string;
    proposedPrice?: number;
  } | null>(null);

  React.useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam) {
      setSelectedBookingId(idParam);
      setDetailsOpen(true);
    }
  }, [searchParams]);

  React.useEffect(() => {
    const activeIntent = sessionStorage.getItem("active_booking_intent");
    if (activeIntent) {
      try {
        const parsed = JSON.parse(activeIntent);
        setPrefilledIntent(parsed);
        setFormOpen(true);
        sessionStorage.removeItem("active_booking_intent");
      } catch (err) {
        console.error("Failed to parse prefilled booking intent.", err);
      }
    }
  }, []);

  const fetchBookings = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getClientBookings({
        status: status || undefined,
        search: search || undefined,
        page,
        limit,
      });
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    } catch (err) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = error.response?.data?.error?.message || "Failed to load bookings list.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [status, search, page]);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleTabChange = (value: string) => {
    setStatus(value === "all" ? "" : value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Portal Breadcrumb: Dashboard > My Bookings */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
        <a href="/client/dashboard" className="hover:text-text-primary transition-colors">
          Dashboard
        </a>
        <span className="text-text-muted">›</span>
        <span className="text-text-primary">My Bookings</span>
      </nav>

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-primary" />
            My Event Bookings
          </h1>
          <p className="text-xs text-text-secondary">
            View booking status, perform counters/negotiations, and reservation history records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchBookings}
            className="flex items-center gap-1.5 text-xs h-9 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setFormOpen(true)}
            className="font-bold text-xs h-9 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Booking Request</span>
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <div className="space-y-4">
        {/* Filters */}
        <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 max-w-sm flex-1">
            <Search className="h-4.5 w-4.5 text-text-muted shrink-0" />
            <Input
              placeholder="Search by event title, location..."
              value={search}
              onChange={handleSearchChange}
              className="h-9 text-xs text-text-primary bg-bg-card border-border/80"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-muted" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 rounded-lg border border-border/80 bg-bg-card text-text-primary text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="negotiation">Negotiation</option>
              <option value="accepted">Accepted</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </Card>

        {/* Tab Filters */}
        <Tabs defaultValue="all" onValueChange={handleTabChange} className="w-full">
          <TabsList className="bg-bg-elevated border border-border/80 p-1 rounded-xl flex flex-wrap gap-1 max-w-lg mb-4">
            <TabsTrigger value="all" className="flex-1 text-xs py-2 rounded-lg">All</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 text-xs py-2 rounded-lg">Pending</TabsTrigger>
            <TabsTrigger value="negotiation" className="flex-1 text-xs py-2 rounded-lg">Negotiation</TabsTrigger>
            <TabsTrigger value="confirmed" className="flex-1 text-xs py-2 rounded-lg">Confirmed</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 text-xs py-2 rounded-lg">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Bookings Table card */}
        <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl overflow-hidden shadow-xl">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Spinner className="h-8 w-8 text-primary" />
                <p className="text-xs text-text-secondary animate-pulse">
                  Querying bookings database...
                </p>
              </div>
            ) : error ? (
              <div className="p-6">
                <ErrorState title="Load failed" message={error} onRetry={fetchBookings} />
              </div>
            ) : (
              <BookingHistoryTable
                bookings={bookings}
                onViewDetails={(b) => {
                  setSelectedBookingId(b.id);
                  setDetailsOpen(true);
                }}
                role="client"
              />
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="text-xs font-bold"
            >
              Previous
            </Button>
            <span className="text-xs text-text-secondary font-medium px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="text-xs font-bold"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      {selectedBookingId && (
        <BookingDetailsDialog
          bookingId={selectedBookingId}
          isOpen={detailsOpen}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedBookingId(null);
          }}
          onRefresh={fetchBookings}
          role="client"
        />
      )}

      {/* Request Form Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && setFormOpen(false)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-bg-card border border-border p-6 rounded-2xl shadow-2xl">
          <BookingRequestForm
            artistProfileId={prefilledIntent?.artistProfileId}
            venueId={prefilledIntent?.venueId}
            artistName={prefilledIntent?.artistName}
            venueName={prefilledIntent?.venueName}
            proposedPrice={prefilledIntent?.proposedPrice}
            onSuccess={() => {
              setFormOpen(false);
              setPrefilledIntent(null);
              fetchBookings();
            }}
            onCancel={() => {
              setFormOpen(false);
              setPrefilledIntent(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
