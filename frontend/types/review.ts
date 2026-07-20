export interface ClientReviewer {
  id: string;
  name: string;
}

export interface UserBrief {
  id: string;
  name: string;
  email?: string;
}

export interface Review {
  id: string;
  booking_id?: string | null;
  reviewer_id?: string | null;
  reviewer_role?: string | null;
  reviewee_id?: string | null;
  reviewee_role?: string | null;
  artist_profile_id?: string | null;
  venue_id?: string | null;
  client_id?: string | null;
  rating: number;
  review_title?: string | null;
  review_text?: string | null;
  comment?: string | null;
  is_public: boolean;
  reply_comment?: string | null;
  reply_at?: string | null;
  images: string[];
  videos: string[];
  reviewer?: UserBrief | null;
  reviewee?: UserBrief | null;
  client?: ClientReviewer | null;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateReviewPayload {
  booking_id?: string;
  reviewee_id?: string;
  reviewee_role?: string;
  artist_profile_id?: string;
  venue_id?: string;
  rating: number;
  review_title?: string;
  review_text?: string;
  comment?: string;
  is_public?: boolean;
  images?: string[];
  videos?: string[];
}

export interface UpdateReviewPayload {
  rating?: number;
  review_title?: string;
  review_text?: string;
  comment?: string;
  is_public?: boolean;
  images?: string[];
  videos?: string[];
}

export interface ReviewFiltersPayload {
  booking_id?: string;
  reviewer_id?: string;
  reviewee_id?: string;
  artist_profile_id?: string;
  venue_id?: string;
  rating?: number;
  is_public?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface ReviewPaginatedResponse {
  items: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ReviewDetail {
  id: string;
  rating: number;
  comment: string;
  review_title?: string | null;
  review_text?: string | null;
  reply_comment: string | null;
  reply_at: string | null;
  images: string[];
  videos: string[];
  client: ClientReviewer;
  created_at: string;
}

export interface ReviewSummaryResponse {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<number, number>;
  reviews: ReviewDetail[];
}

export type RatingDistribution = Record<number, number>;

export interface ReviewEligibility {
  eligible: boolean;
  booking_id: string;
  reviewer_id: string;
  reviewee_id?: string | null;
  reviewee_role?: string | null;
  reason?: string | null;
  already_reviewed: boolean;
}
