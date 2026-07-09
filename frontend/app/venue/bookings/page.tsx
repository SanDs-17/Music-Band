"use client";

import * as React from "react";
import { bookingService } from "@/services/bookingService";
import { BookingRequestDetail } from "@/types/booking";
import { VenueBookingDetails } from "@/components/venue/VenueBookingDetails";
import { VenueBookingCalendarTimeline } from "@/components/venue/VenueBookingCalendarTimeline";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  List, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function VenueBookingsPage() {
  const [bookings, setBookings] = React.useState<BookingRequestDetail[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filter and pagination state
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const limit = 10;

  // Detailed selected booking inspector dialog state
  const [selectedBooking, setSelectedBooking] = React.useState<BookingRequestDetail | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const fetchBookings = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getVenueBookings({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchQuery.trim() || undefined,
        page,
        limit
      });
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    } catch {
      setError("Failed to fetch venue booking requests.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, page]);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Handle pagination
  const totalPages = Math.ceil(total / limit);

  // Status transitions actions
  const handleAcceptBooking = async (id: string) => {
    try {
      await bookingService.acceptVenueBooking(id);
      toast.success("Venue booking accepted successfully!");
      fetchBookings();
    } catch {
      toast.error("Failed to accept reservation.");
      throw new Error();
    }
  };

  const handleRejectBooking = async (id: string) => {
    try {
      await bookingService.rejectVenueBooking(id);
      toast.success("Venue booking request rejected.");
      fetchBookings();
    } catch {
      toast.error("Failed to reject reservation.");
      throw new Error();
    }
  };

  const handleCompleteBooking = async (id: string) => {
    try {
      await bookingService.completeVenueBooking(id);
      toast.success("Venue booking marked as completed!");
      fetchBookings();
    } catch {
      toast.error("Failed to complete reservation.");
      throw new Error();
    }
  };

  const handleCancelBooking = async (id: string) => {
    try {
      await bookingService.cancelVenueBooking(id);
      toast.success("Venue booking reservation cancelled.");
      fetchBookings();
    } catch {
      toast.error("Failed to cancel reservation.");
      throw new Error();
    }
  };

  const openDetails = (booking: BookingRequestDetail) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/25">Pending</Badge>;
      case "accepted":
        return <Badge className="bg-primary/10 text-primary border border-primary/25">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-error/10 text-error border border-error/25">Rejected</Badge>;
      case "cancelled":
        return <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/25">Cancelled</Badge>;
      case "completed":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">Completed</Badge>;
      default:
        return <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/25">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <CheckCircle2 className="h-6.5 w-6.5 text-primary" />
          Venue Booking Management
        </h1>
        <p className="text-xs text-text-secondary">
          Approve incoming client space requests, check scheduled events, and manage completed reservations.
        </p>
      </div>

      <Tabs defaultValue="schedule" className="w-full space-y-6">
        <TabsList className="bg-bg-elevated border border-border/80 p-1 rounded-xl flex gap-1 self-start max-w-md">
          <TabsTrigger value="schedule" className="flex items-center gap-1.5 text-xs py-2 px-4 rounded-lg w-1/2 justify-center">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Event Calendar / Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-1.5 text-xs py-2 px-4 rounded-lg w-1/2 justify-center">
            <List className="h-3.5 w-3.5" />
            <span>All Requests Table</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Calendar View */}
        <TabsContent value="schedule" className="outline-none">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
              <Spinner className="h-10 w-10 text-primary" />
              <p className="text-sm text-text-secondary">Loading schedule visualizer...</p>
            </div>
          ) : error ? (
            <ErrorState title="Load Error" message={error} onRetry={fetchBookings} />
          ) : (
            <VenueBookingCalendarTimeline bookings={bookings} onSelectBooking={openDetails} />
          )}
        </TabsContent>

        {/* Tab 2: Requests Table List */}
        <TabsContent value="requests" className="outline-none space-y-4">
          
          {/* Controls: Search, Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 border border-border/60 bg-bg-elevated/15 rounded-2xl">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-text-muted" />
              <Input 
                placeholder="Search event name or client..." 
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9.5 text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-text-secondary w-full md:w-auto justify-end">
              <Filter className="h-3.5 w-3.5 text-text-muted" />
              <span>Status:</span>
              <select 
                value={statusFilter} 
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-8.5 px-2.5 rounded-lg border border-border bg-bg-card text-white text-[11px]"
              >
                <option value="all">All Request Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh]">
              <Spinner className="h-8 w-8 text-primary" />
            </div>
          ) : error ? (
            <ErrorState title="Load Error" message={error} onRetry={fetchBookings} />
          ) : (
            <div className="border border-border/80 bg-bg-card/45 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-bg-elevated/20 border-b border-border/70 text-text-muted font-bold text-[10px] uppercase">
                      <th className="p-4">Event Name</th>
                      <th className="p-4">Event Date</th>
                      <th className="p-4">Timeslot</th>
                      <th className="p-4">Client Name</th>
                      <th className="p-4">Price Offer</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} className="border-b border-border/40 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white max-w-xs truncate">{b.event_name}</td>
                        <td className="p-4 text-text-secondary">
                          {format(new Date(b.event_date), "do MMM yyyy")}
                        </td>
                        <td className="p-4 text-text-secondary">{b.start_time} - {b.end_time}</td>
                        <td className="p-4 text-white font-medium">{b.client.name}</td>
                        <td className="p-4 font-bold text-primary">₹{Number(b.proposed_price).toLocaleString("en-IN")}</td>
                        <td className="p-4 text-center">{getStatusBadge(b.status)}</td>
                        <td className="p-4 text-right">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => openDetails(b)}
                            className="h-8 w-8 text-text-muted hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-text-muted italic">
                          No booking requests match your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border/40 bg-bg-card/20 text-xs">
                  <span className="text-text-muted">
                    Showing page {page} of {totalPages} ({total} entries total)
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-8 text-[11px] font-bold"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="h-8 text-[11px] font-bold"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

            </div>
          )}

        </TabsContent>
      </Tabs>

      {/* Details Viewer Overlay */}
      <VenueBookingDetails
        booking={selectedBooking}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAccept={handleAcceptBooking}
        onReject={handleRejectBooking}
        onComplete={handleCompleteBooking}
        onCancel={handleCancelBooking}
      />

    </div>
  );
}
