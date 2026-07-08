"use client";

import * as React from "react";
import { useArtistReviews } from "@/hooks/use-artist-reviews";
import { reviewService } from "@/services/reviewService";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { 
  Star, 
  MessageSquare, 
  Search, 
  Filter, 
  CornerDownRight, 
  MessageCircle, 
  RefreshCw, 
  Play
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function ArtistReviewsPage() {
  const {
    reviews,
    averageRating,
    totalReviews,
    distribution,
    loading,
    error,
    ratingFilter,
    setRatingFilter,
    search,
    setSearch,
    page,
    setPage,
    limit,
    refetch
  } = useArtistReviews();

  // Reply states
  const [activeReplyId, setActiveReplyId] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState("");
  const [submittingReply, setSubmittingReply] = React.useState(false);

  const totalPages = Math.ceil(totalReviews / limit);

  const renderStars = (rating: number, size = "h-4 w-4") => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, idx) => {
          const active = idx < rating;
          return (
            <Star 
              key={idx} 
              className={`${size} ${active ? "text-yellow-400 fill-current" : "text-border/80"}`} 
            />
          );
        })}
      </div>
    );
  };

  const handleReplySubmit = async (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      await reviewService.replyToReview(reviewId, replyText.trim());
      toast.success("Reply posted successfully!");
      setReplyText("");
      setActiveReplyId(null);
      refetch();
    } catch {
      toast.error("Failed to post reply.");
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading && page === 1 && reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-sm text-text-secondary animate-pulse">
          Loading performer reviews overview...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[65vh] p-4">
        <ErrorState 
          title="Reviews Load Failure"
          message={error} 
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Verified Customer Reviews
          </h1>
          <p className="text-xs text-text-secondary">
            Read reviews from hosts and respond to inquiries or booking feedbacks.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refetch}
          className="flex items-center gap-1.5 self-start sm:self-center text-xs h-9"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reload Feed</span>
        </Button>
      </div>

      {/* Grid: Stats & distribution summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total stats card */}
        <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 p-5 rounded-2xl shadow-xl flex flex-col justify-center items-center text-center">
          <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-2">Average performer Rating</span>
          <span className="text-5xl font-black text-white tracking-tight block">
            {averageRating.toFixed(1)}
          </span>
          <div className="mt-3">
            {renderStars(Math.round(averageRating), "h-5 w-5")}
          </div>
          <span className="text-xs text-text-muted mt-3 block">
            Based on {totalReviews} verified bookings.
          </span>
        </Card>

        {/* Rating distribution progress bars */}
        <Card className="md:col-span-2 bg-bg-card/45 backdrop-blur-md border border-border/80 p-5 rounded-2xl shadow-xl space-y-3 justify-center flex flex-col">
          {([5, 4, 3, 2, 1] as const).map(stars => {
            const count = distribution[stars] || 0;
            const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-10 text-white font-bold text-right flex items-center justify-end gap-1">
                  {stars} <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-border/40 overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-8 text-text-muted text-left font-semibold">
                  {count}
                </span>
              </div>
            );
          })}
        </Card>

      </div>

      {/* Filter and Search controls */}
      <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 max-w-sm flex-1">
          <Search className="h-4.5 w-4.5 text-text-muted shrink-0" />
          <Input
            placeholder="Search reviews..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 text-xs text-white"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-muted" />
          <select
            value={ratingFilter || ""}
            onChange={e => {
              const val = e.target.value;
              setRatingFilter(val ? Number(val) : undefined);
              setPage(1);
            }}
            className="h-9 px-3 rounded-lg border border-border bg-bg-card text-white text-xs"
          >
            <option value="">All Stars</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </Card>

      {/* Reviews feed List */}
      <div className="space-y-4">
        {reviews.map(rev => (
          <Card key={rev.id} className="bg-bg-card/45 backdrop-blur-md border border-border/80 p-5 rounded-2xl shadow-xl space-y-4 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
              <div className="space-y-0.5">
                <span className="text-sm font-extrabold text-white block">{rev.client.name}</span>
                <span className="text-[10px] text-text-muted block">
                  Reviewed on {format(new Date(rev.created_at), "dd MMM yyyy HH:mm")}
                </span>
              </div>
              <div>{renderStars(rev.rating)}</div>
            </div>

            {/* Comment text */}
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {rev.comment}
            </p>

            {/* Customer media uploads */}
            {((rev.images && rev.images.length > 0) || (rev.videos && rev.videos.length > 0)) && (
              <div className="flex flex-wrap gap-2.5 pt-2">
                {rev.images?.map((img, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-bg-elevated relative group">
                    <Image src={img} alt="Customer upload" fill className="object-cover" />
                  </div>
                ))}
                {rev.videos?.map((vid, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-bg-elevated flex items-center justify-center relative">
                    <video src={vid} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="h-4.5 w-4.5 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Replied block or reply form */}
            <div className="pl-4 border-l-2 border-primary/40 space-y-3">
              {rev.reply_comment ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                    <CornerDownRight className="h-4 w-4" />
                    <span>Your Response</span>
                    {rev.reply_at && (
                      <span className="text-[10px] text-text-muted font-normal">
                        ({format(new Date(rev.reply_at), "dd MMM yyyy")})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed bg-bg-elevated/10 border border-border/40 p-3 rounded-xl">
                    {rev.reply_comment}
                  </p>
                </div>
              ) : activeReplyId === rev.id ? (
                <form onSubmit={(e) => handleReplySubmit(e, rev.id)} className="space-y-3">
                  <div className="flex items-center gap-1 text-xs text-primary font-bold">
                    <CornerDownRight className="h-4 w-4" />
                    <span>Write performer reply</span>
                  </div>
                  <Textarea
                    rows={2}
                    placeholder="E.g. Thank you for booking us! We had a wonderful time playing for your wedding guests."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="text-xs"
                  />
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={submittingReply || !replyText.trim()}
                      className="bg-primary text-white h-8 text-[11px] font-bold"
                    >
                      Post Response
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => {
                        setActiveReplyId(null);
                        setReplyText("");
                      }}
                      variant="outline"
                      className="h-8 text-[11px]"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <Button 
                  onClick={() => {
                    setActiveReplyId(rev.id);
                    setReplyText("");
                  }}
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-[11px] font-bold border-primary/40 text-primary hover:bg-primary/5 flex items-center gap-1.5"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Reply to this review</span>
                </Button>
              )}
            </div>
          </Card>
        ))}

        {reviews.length === 0 && (
          <div className="py-20 text-center text-xs text-text-muted italic border border-dashed border-border rounded-2xl bg-bg-card/20">
            No verified reviews found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-xs mt-4">
          <span className="text-text-muted">Showing page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="h-8"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="h-8"
            >
              Next
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
