"use client";

import * as React from "react";
import { BookingRequestDetail } from "@/types/booking";
import { bookingService } from "@/services/bookingService";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { BookingTimeline } from "./BookingTimeline";
import { BookingInformationCard } from "./BookingInformationCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { IndianRupee, MessageSquare, Send, X, Check, Ban, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface BookingDetailsDialogProps {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  role: "client" | "artist" | "venue" | "admin";
}

export function BookingDetailsDialog({
  bookingId,
  isOpen,
  onClose,
  onRefresh,
  role,
}: BookingDetailsDialogProps) {
  const [booking, setBooking] = React.useState<BookingRequestDetail | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [actioning, setActioning] = React.useState<boolean>(false);
  
  // Note thread comment input
  const [newComment, setNewComment] = React.useState<string>("");
  
  // Counter box values
  const [showCounterBox, setShowCounterBox] = React.useState<boolean>(false);
  const [counterPrice, setCounterPrice] = React.useState<string>("");
  const [counterReason, setCounterReason] = React.useState<string>("");

  const fetchBookingDetails = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingService.getBookingDetails(bookingId);
      setBooking(data);
    } catch {
      toast.error("Failed to load booking details.");
      onClose();
    } finally {
      setLoading(false);
    }
  }, [bookingId, onClose]);

  React.useEffect(() => {
    if (isOpen && bookingId) {
      fetchBookingDetails();
    }
  }, [isOpen, bookingId, fetchBookingDetails]);

  const handleStatusAction = async (action: "accept" | "reject" | "cancel" | "complete") => {
    setActioning(true);
    try {
      let res: BookingRequestDetail;
      if (action === "accept") {
        res = await bookingService.acceptBooking(bookingId);
        toast.success("Booking request accepted!");
      } else if (action === "reject") {
        res = await bookingService.rejectBooking(bookingId);
        toast.success("Booking request rejected.");
      } else if (action === "cancel") {
        res = await bookingService.cancelBooking(bookingId);
        toast.success("Booking cancelled.");
      } else {
        res = await bookingService.completeVenueBooking(bookingId);
        toast.success("Event marked as completed!");
      }
      setBooking(res);
      if (onRefresh) onRefresh();
    } catch (err) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = error.response?.data?.error?.message || `Failed to perform ${action} action.`;
      toast.error(msg);
    } finally {
      setActioning(false);
    }
  };

  const handleCounterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(counterPrice);
    if (!price || price <= 0) {
      toast.error("Please enter a valid counter price.");
      return;
    }

    setActioning(true);
    try {
      const res = await bookingService.counterOffer(bookingId, price, counterReason);
      toast.success("Counter offer submitted successfully!");
      setBooking(res);
      setShowCounterBox(false);
      setCounterPrice("");
      setCounterReason("");
      if (onRefresh) onRefresh();
    } catch (err) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = error.response?.data?.error?.message || "Failed to submit counter offer.";
      toast.error(msg);
    } finally {
      setActioning(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setActioning(true);
    try {
      await bookingService.addBookingNote(bookingId, newComment.trim());
      setNewComment("");
      toast.success("Comment added.");
      // Reload full detail to populate notes list & timeline
      const updated = await bookingService.getBookingDetails(bookingId);
      setBooking(updated);
    } catch {
      toast.error("Failed to add comment.");
    } finally {
      setActioning(false);
    }
  };

  const canAccept = booking && ["pending", "under_review", "negotiation"].includes(booking.status) && role !== "client";
  const canReject = booking && ["pending", "under_review", "negotiation"].includes(booking.status) && role !== "client";
  const canCounter = booking && ["pending", "under_review", "negotiation"].includes(booking.status);
  const canCancel = booking && ["pending", "under_review", "negotiation", "accepted", "confirmed"].includes(booking.status);
  const canComplete = booking && ["accepted", "confirmed"].includes(booking.status) && role !== "client";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-bg-card border border-border rounded-2xl shadow-2xl p-6 text-xs text-text-secondary scrollbar-thin">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner className="h-10 w-10 text-primary" />
            <p className="text-sm animate-pulse text-text-secondary">
              Retrieving booking parameters...
            </p>
          </div>
        ) : !booking ? (
          <div className="text-center py-10 text-sm">Failed to load booking.</div>
        ) : (
          <div className="space-y-6">
            <DialogHeader className="border-b border-border/60 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                    {booking.event_type} Request
                  </span>
                  <DialogTitle className="text-lg font-extrabold text-text-primary font-heading tracking-tight leading-none">
                    {booking.event_title}
                  </DialogTitle>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <BookingStatusBadge status={booking.status} />
                  <span className="text-[10px] text-text-muted">
                    ID: {booking.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Logistics Card & Action Triggers */}
              <div className="lg:col-span-2 space-y-6">
                <BookingInformationCard booking={booking} />

                {/* Counter offer sub form box */}
                {showCounterBox && (
                  <form
                    onSubmit={handleCounterSubmit}
                    className="bg-bg-elevated/40 border border-primary/20 rounded-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-1"
                  >
                    <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      Submit Price Counter Offer
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5 sm:col-span-1">
                        <Label htmlFor="counter_price">Counter Rate (INR)</Label>
                        <Input
                          id="counter_price"
                          type="number"
                          placeholder="e.g. 18000"
                          value={counterPrice}
                          onChange={(e) => setCounterPrice(e.target.value)}
                          className="text-text-primary text-xs bg-bg-card border-border/80 h-9"
                          required
                        />
                      </div>
                      
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="counter_reason">Note/Reason for counter</Label>
                        <Input
                          id="counter_reason"
                          placeholder="e.g. Travel cost adjustment or extended performance duration."
                          value={counterReason}
                          onChange={(e) => setCounterReason(e.target.value)}
                          className="text-text-primary text-xs bg-bg-card border-border/80 h-9"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCounterBox(false)}
                        className="font-bold text-[10px] h-8"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={actioning}
                        className="font-bold text-[10px] h-8 px-3"
                      >
                        {actioning ? "Sending..." : "Submit Counter"}
                      </Button>
                    </div>
                  </form>
                )}

                {/* State Control Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/50">
                  {canAccept && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusAction("accept")}
                      disabled={actioning}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Accept Inquiry</span>
                    </Button>
                  )}

                  {canReject && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusAction("reject")}
                      disabled={actioning}
                      className="border-red-500/30 hover:bg-red-500/10 text-red-400 font-bold h-9 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Ban className="h-4 w-4" />
                      <span>Reject Inquiry</span>
                    </Button>
                  )}

                  {canCounter && !showCounterBox && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCounterPrice(String(booking.counter_price || booking.proposed_price));
                        setShowCounterBox(true);
                      }}
                      disabled={actioning}
                      className="border-blue-500/30 hover:bg-blue-500/10 text-blue-400 font-bold h-9 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <IndianRupee className="h-4 w-4" />
                      <span>Counter Offer</span>
                    </Button>
                  )}

                  {canComplete && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusAction("complete")}
                      disabled={actioning}
                      className="bg-primary hover:bg-primary-hover text-white font-bold h-9 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckSquare className="h-4 w-4" />
                      <span>Conclude & Complete</span>
                    </Button>
                  )}

                  {canCancel && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusAction("cancel")}
                      disabled={actioning}
                      className="border-border hover:bg-bg-elevated hover:text-text-primary font-bold h-9 text-xs flex items-center gap-1.5 cursor-pointer ml-auto"
                    >
                      <X className="h-4 w-4 text-text-muted" />
                      <span>Cancel Booking</span>
                    </Button>
                  )}
                </div>

                {/* Comment / Note Thread */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Negotiation Thread & Comments
                  </h4>

                  {/* Messages listing */}
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {booking.booking_notes.length === 0 ? (
                      <p className="text-[10px] text-text-muted italic py-2">
                        No comment notes posted yet. Submit a message below to start negotiation chat.
                      </p>
                    ) : (
                      booking.booking_notes.map((note) => (
                        <div
                          key={note.id}
                          className={`p-3 rounded-xl border flex flex-col gap-1 ${
                            note.author_role === role
                              ? "bg-primary/5 border-primary/20 self-end ml-10"
                              : "bg-bg-elevated/40 border-border/60 mr-10"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-bold text-text-primary capitalize">
                              {note.author_role}
                            </span>
                            <span className="text-[8px] text-text-muted">
                              {format(new Date(note.created_at), "PPp")}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add comment form */}
                  <form onSubmit={handleAddComment} className="flex gap-2 items-center">
                    <Input
                      placeholder="Type a negotiation comment or message..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="text-text-primary text-xs bg-bg-card border-border/80 flex-1 h-9"
                    />
                    <Button
                      type="submit"
                      disabled={actioning || !newComment.trim()}
                      size="icon"
                      className="h-9 w-9 shrink-0 cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>

              {/* Right Column: Timeline Tracking */}
              <div className="space-y-4 lg:border-l lg:border-border/60 lg:pl-6">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Request Timeline Flow
                </h4>
                <BookingTimeline events={booking.timeline_events} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
