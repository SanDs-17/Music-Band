"use client";

import * as React from "react";
import { reviewService } from "@/services/reviewService";
import { ReviewDetail, RatingDistribution } from "@/types/review";

export function useReviews(type: "artist" | "venue") {
  const [reviews, setReviews] = React.useState<ReviewDetail[]>([]);
  const [averageRating, setAverageRating] = React.useState(0);
  const [totalReviews, setTotalReviews] = React.useState(0);
  const [distribution, setDistribution] = React.useState<RatingDistribution>({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters state
  const [ratingFilter, setRatingFilter] = React.useState<number | undefined>(undefined);
  const [search, setSearch] = React.useState<string>("");
  const [page, setPage] = React.useState<number>(1);
  const limit = 10;

  const fetchReviews = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchFn =
        type === "artist"
          ? reviewService.getArtistReviews
          : reviewService.getVenueReviews;

      const data = await fetchFn({
        rating: ratingFilter,
        search: search.trim() || undefined,
        page,
        limit,
      });

      setReviews(data.reviews || []);
      setAverageRating(data.average_rating || 0);
      setTotalReviews(data.total_reviews || 0);
      setDistribution(
        data.rating_distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      );
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          `Failed to load ${type} reviews.`
      );
    } finally {
      setLoading(false);
    }
  }, [type, ratingFilter, search, page]);

  React.useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
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
    refetch: fetchReviews,
  };
}
