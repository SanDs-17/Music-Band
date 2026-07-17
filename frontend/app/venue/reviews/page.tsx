"use client";

import * as React from "react";
import Image from "next/image";
import { reviewService } from "@/services/reviewService";
import { useReviews } from "@/hooks/use-reviews";
import { ReviewDetail } from "@/types/review";
import { VenueReviewsSummary } from "@/components/venue/VenueReviewsSummary";
import { VenueReviewDetailsReply } from "@/components/venue/VenueReviewDetailsReply";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Star, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight,
  Reply,
  Calendar,
  User
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function VenueReviewsPage() {
  const {
    reviews,
    averageRating,
    totalReviews: total,
    distribution,
    loading,
    error,
    ratingFilter,
    setRatingFilter,
    search: searchQuery,
    setSearch: setSearchQuery,
    page,
    setPage,
    limit,
    refetch: fetchReviews
  } = useReviews("venue");

  // Selected review for replying modal state
  const [selectedReview, setSelectedReview] = React.useState<ReviewDetail | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const totalPages = Math.ceil(total / limit);

  const handleReplySubmit = async (reviewId: string, replyText: string) => {
    try {
      await reviewService.replyToVenueReview(reviewId, replyText);
      toast.success("Professional reply published successfully!");
      fetchReviews();
    } catch {
      toast.error("Failed to post professional reply.");
      throw new Error();
    }
  };

  const openReplyDialog = (review: ReviewDetail) => {
    setSelectedReview(review);
    setDialogOpen(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${
          i < rating ? "text-amber-400 fill-amber-400" : "text-border fill-transparent"
        }`} 
      />
    ));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6.5 w-6.5 text-primary" />
          Client Reviews & Feedback
        </h1>
        <p className="text-xs text-text-secondary">
          Track customer ratings, inspect uploaded pictures, and post professional replies to testimonials.
        </p>
      </div>

      {loading && reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <Spinner className="h-10 w-10 text-primary" />
          <p className="text-sm text-text-secondary">Loading reviews feedback...</p>
        </div>
      ) : error ? (
        <ErrorState title="Load Error" message={error} onRetry={fetchReviews} />
      ) : (
        <div className="space-y-6">
          
          {/* Summary Dashboard Card */}
          <VenueReviewsSummary 
            averageRating={averageRating}
            totalReviews={total}
            distribution={distribution}
          />

          {/* Controls: Search, Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 border border-border/60 bg-bg-elevated/15 rounded-2xl">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-text-muted" />
              <Input 
                placeholder="Search review content or name..." 
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
              <span>Rating:</span>
              <select 
                value={ratingFilter || "all"} 
                onChange={e => {
                  const val = e.target.value;
                  setRatingFilter(val === "all" ? undefined : Number(val));
                  setPage(1);
                }}
                className="h-8.5 px-2.5 rounded-lg border border-border bg-bg-card text-text-primary text-[11px]"
              >
                <option value="all">All Rating Scores</option>
                <option value="5">5 Stars only</option>
                <option value="4">4 Stars only</option>
                <option value="3">3 Stars only</option>
                <option value="2">2 Stars only</option>
                <option value="1">1 Star only</option>
              </select>
            </div>
          </div>

          {/* Reviews List Feed */}
          <div className="space-y-4">
            {reviews.map(r => (
              <div 
                key={r.id}
                className="p-5 border border-border/80 bg-bg-card/45 backdrop-blur-md rounded-2xl shadow space-y-4 text-text-primary"
              >
                {/* Upper line: Reviewer info & rating */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                      <User className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-text-primary">{r.client.name}</p>
                      <p className="text-[10px] text-text-muted flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(r.created_at), "do MMMM, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {renderStars(r.rating)}
                  </div>
                </div>

                {/* Comment Content */}
                <p className="text-xs text-text-secondary leading-relaxed bg-bg-card/40 p-3 rounded-xl border border-border/40">
                  &quot;{r.comment}&quot;
                </p>

                {/* Client Media Attachments */}
                {r.images && r.images.length > 0 && (
                  <div className="flex gap-2">
                    {r.images.map((img, idx) => (
                      <a 
                        key={idx} 
                        href={img} 
                        target="_blank" 
                        rel="noreferrer"
                        className="h-14 w-14 border border-border rounded-lg overflow-hidden block relative hover:border-primary transition-all"
                      >
                        <div className="relative h-full w-full">
                          <Image src={img} alt="review pic" fill className="object-cover" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {/* Existing Reply block or Action Button */}
                {r.reply_comment ? (
                  <div className="pl-4 border-l-2 border-primary space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                        <Reply className="h-3 w-3" />
                        Your Reply
                      </span>
                      <span className="text-[9px] text-text-muted">
                        {r.reply_at ? format(new Date(r.reply_at), "MMM d, yyyy") : ""}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary italic">&quot;{r.reply_comment}&quot;</p>
                    <button 
                      onClick={() => openReplyDialog(r)}
                      type="button" 
                      className="text-[10px] font-bold text-primary hover:underline pt-1 block"
                    >
                      Edit Reply
                    </button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openReplyDialog(r)}
                    className="h-8 text-[10px] font-bold border-primary/30 text-primary hover:bg-primary/5 flex items-center gap-1.5"
                  >
                    <Reply className="h-3.5 w-3.5" />
                    <span>Post Reply</span>
                  </Button>
                )}

              </div>
            ))}
            
            {reviews.length === 0 && (
              <p className="text-xs text-text-muted italic text-center py-12 border border-dashed border-border rounded-2xl">
                No reviews found matching search or rating level.
              </p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border border-border/80 bg-bg-card/45 backdrop-blur-md rounded-2xl text-xs">
              <span className="text-text-muted">
                Showing page {page} of {totalPages}
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

      {/* Reply Modal */}
      <VenueReviewDetailsReply 
        review={selectedReview}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onReplySubmit={handleReplySubmit}
      />

    </div>
  );
}
