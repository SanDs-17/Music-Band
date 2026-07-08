import { api } from "./api";
import { ReviewSummaryResponse, ReviewDetail } from "@/types/review";

export const reviewService = {
  getArtistReviews: async (params: {
    rating?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ReviewSummaryResponse> => {
    const response = await api.get<any>("/reviews/artist", { params });
    return response.data.data;
  },

  replyToReview: async (reviewId: string, replyComment: string): Promise<ReviewDetail> => {
    const response = await api.put<any>(`/reviews/${reviewId}/reply`, {
      reply_comment: replyComment
    });
    return response.data.data;
  }
};
