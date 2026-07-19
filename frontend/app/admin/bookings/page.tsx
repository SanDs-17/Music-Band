"use client";

import * as React from "react";
import {
  Search,
  SlidersHorizontal,
  ShieldAlert,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AdminPageContainer } from "@/components/layout/admin/AdminPageContainer";
import { bookingService } from "@/services/bookingService";
import { BookingRequestDetail } from "@/types/booking";
import { formatCurrency } from "@/utils/format-currency";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function AdminBookingsPage() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);

  const [bookings, setBookings] = React.useState<BookingRequestDetail[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  // Dispute Resolve Dialog states
  const [selectedBooking, setSelectedBooking] = React.useState<BookingRequestDetail | null>(null);
  const [disputeOpen, setDisputeOpen] = React.useState(false);
  const [targetStatus, setTargetStatus] = React.useState<string>("");
  const [overrideMessage, setOverrideMessage] = React.useState("");
  const [submittingDispute, setSubmittingDispute] = React.useState(false);

  const fetchBookings = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingService.adminGetBookings({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search || undefined,
        page,
        limit,
      });
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load bookings database.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, limit]);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleOpenDispute = (booking: BookingRequestDetail) => {
    setSelectedBooking(booking);
    setTargetStatus(booking.status);
    setOverrideMessage("");
    setDisputeOpen(true);
  };

  const handleResolveDispute = async () => {
    if (!selectedBooking) return;
    setSubmittingDispute(true);
    try {
      await bookingService.adminResolveDispute(selectedBooking.id, targetStatus, overrideMessage);
      toast.success("Booking status overridden successfully.");
      setDisputeOpen(false);
      fetchBookings();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to override booking status.";
      toast.error(errorMsg);
    } finally {
      setSubmittingDispute(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <AdminPageContainer
      title="Platform Bookings Audit"
      description="View, audit, and resolve disputes by overriding booking status across the platform."
    >
      <div className="space-y-6">
        {/* Controls Card */}
        <Card className="bg-bg-card/40 backdrop-blur-md border border-border/40">
          <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <Input
                placeholder="Search event name, location..."
                value={search}
                onChange={handleSearchChange}
                className="pl-9 h-10 bg-bg-primary/50 border-border/60 text-xs font-semibold focus-visible:ring-primary"
              />
            </div>

            {/* Filter and Action buttons */}
            <div className="flex flex-wrap w-full md:w-auto items-center gap-3 justify-end">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-text-muted hidden sm:inline" />
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-[160px] h-10 bg-bg-primary/50 border-border/60 text-xs font-semibold focus:ring-primary">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-card border-border/60">
                    <SelectItem value="all" className="text-xs font-medium">All Statuses</SelectItem>
                    <SelectItem value="pending" className="text-xs font-medium">Pending</SelectItem>
                    <SelectItem value="accepted" className="text-xs font-medium">Accepted</SelectItem>
                    <SelectItem value="rejected" className="text-xs font-medium">Rejected</SelectItem>
                    <SelectItem value="counter_offered" className="text-xs font-medium">Counter Offered</SelectItem>
                    <SelectItem value="confirmed" className="text-xs font-medium">Confirmed</SelectItem>
                    <SelectItem value="completed" className="text-xs font-medium">Completed</SelectItem>
                    <SelectItem value="cancelled" className="text-xs font-medium">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchBookings}
                className="h-10 px-3 flex items-center gap-1.5 border-border/60 bg-bg-primary/50 hover:bg-bg-elevated/40"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="bg-bg-card/30 border border-border/40 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center items-center">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Calendar className="h-12 w-12 text-text-muted mb-4" />
              <h3 className="font-bold text-text-primary text-base">No bookings found</h3>
              <p className="text-xs text-text-secondary max-w-sm mt-1">
                There are no bookings matching the current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table className="w-full text-xs">
                <TableHeader className="bg-bg-elevated/20 border-b border-border/40">
                  <TableRow>
                    <TableHead className="p-4 font-bold text-text-primary uppercase tracking-wider">Event / Type</TableHead>
                    <TableHead className="p-4 font-bold text-text-primary uppercase tracking-wider">Date & Time</TableHead>
                    <TableHead className="p-4 font-bold text-text-primary uppercase tracking-wider">Client Info</TableHead>
                    <TableHead className="p-4 font-bold text-text-primary uppercase tracking-wider">Budget (INR)</TableHead>
                    <TableHead className="p-4 font-bold text-text-primary uppercase tracking-wider">Status</TableHead>
                    <TableHead className="p-4 font-bold text-text-primary uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/20">
                  {bookings.map((b) => (
                    <TableRow key={b.id} className="hover:bg-bg-elevated/10 transition-colors">
                      <TableCell className="p-4 font-medium">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-text-primary text-sm tracking-tight">{b.event_name}</p>
                          <p className="text-[10px] text-text-muted truncate max-w-xs">{b.location}</p>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-text-primary">{format(new Date(b.event_date), "PP")}</p>
                          <p className="text-[10px] text-text-muted">{b.start_time} - {b.end_time}</p>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-text-primary">{b.client?.name || "N/A"}</p>
                          <p className="text-[10px] text-text-muted truncate max-w-36">{b.client?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="p-4 font-bold text-text-primary">
                        {formatCurrency(b.proposed_price)}
                        {b.counter_price && (
                          <span className="block text-[10px] text-primary">Counter: {formatCurrency(b.counter_price)}</span>
                        )}
                      </TableCell>
                      <TableCell className="p-4">
                        <Badge
                          variant="secondary"
                          className={`font-semibold capitalize text-[10px] px-2 py-0.5 border ${
                            b.status === "confirmed" || b.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : b.status === "cancelled" || b.status === "rejected"
                              ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}
                        >
                          {b.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDispute(b)}
                          className="font-bold text-[10px] h-8 px-2 flex items-center gap-1 hover:text-text-primary cursor-pointer border border-border/40 hover:bg-bg-elevated/40 ml-auto"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                          <span>Override / Dispute</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-text-secondary font-medium">
              Showing page {page} of {totalPages} ({total} total bookings)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 w-8 p-0 border-border/60 hover:bg-bg-elevated/20"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 w-8 p-0 border-border/60 hover:bg-bg-elevated/20"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Dispute / Override Status Dialog */}
        <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
          <DialogContent className="bg-bg-card border-border/60 text-text-primary max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-black tracking-tight text-text-primary">
                <ShieldAlert className="h-5 w-5 text-primary" />
                Administrative Override Resolver
              </DialogTitle>
              <DialogDescription className="text-xs text-text-secondary mt-1">
                Forcefully update the state of booking reference:{" "}
                <span className="font-bold text-text-primary">
                  {selectedBooking?.event_name}
                </span>
              </DialogDescription>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-4 my-4">
                {/* Details snapshot */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-bg-primary/40 border border-border/40 text-[11px] font-medium text-text-secondary">
                  <div>
                    <span className="block text-[10px] text-text-muted">Client Name:</span>
                    <span className="text-text-primary font-bold">{selectedBooking.client?.name}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-text-muted">Proposed Price:</span>
                    <span className="text-text-primary font-bold">{formatCurrency(selectedBooking.proposed_price)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-text-muted">Current Status:</span>
                    <Badge variant="outline" className="font-bold py-0.5 px-2 mt-0.5">{selectedBooking.status}</Badge>
                  </div>
                  <div>
                    <span className="block text-[10px] text-text-muted">Event Date:</span>
                    <span className="text-text-primary font-bold">{format(new Date(selectedBooking.event_date), "PP")}</span>
                  </div>
                </div>

                {/* Status selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-primary">Override Status Target</label>
                  <Select value={targetStatus} onValueChange={setTargetStatus}>
                    <SelectTrigger className="w-full bg-bg-primary/50 border-border/60 text-xs font-semibold focus:ring-primary">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-card border-border/60">
                      <SelectItem value="pending" className="text-xs font-medium">Pending</SelectItem>
                      <SelectItem value="accepted" className="text-xs font-medium">Accepted</SelectItem>
                      <SelectItem value="rejected" className="text-xs font-medium">Rejected</SelectItem>
                      <SelectItem value="confirmed" className="text-xs font-medium">Confirmed</SelectItem>
                      <SelectItem value="cancelled" className="text-xs font-medium">Cancelled</SelectItem>
                      <SelectItem value="completed" className="text-xs font-medium">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Resolution note */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-primary">Audit Override Reason</label>
                  <textarea
                    placeholder="Provide details about the dispute resolution or override rationale..."
                    value={overrideMessage}
                    onChange={(e) => setOverrideMessage(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-lg border border-border/60 bg-bg-primary/50 text-xs font-semibold focus-visible:ring-primary focus-visible:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setDisputeOpen(false)}
                className="border-border/60 hover:bg-bg-elevated/20 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                disabled={submittingDispute}
                onClick={handleResolveDispute}
                className="bg-primary hover:bg-primary/95 text-xs font-bold"
              >
                {submittingDispute ? "Applying Override..." : "Confirm Override"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminPageContainer>
  );
}
