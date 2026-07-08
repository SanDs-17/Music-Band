export interface ClientReviewer {
  id: string;
  name: string;
}

export interface ReviewDetail {
  id: string;
  rating: number;
  comment: string;
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
