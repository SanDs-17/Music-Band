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
  },

  getVenueReviews: async (params: {
    rating?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ReviewSummaryResponse> => {
    const response = await api.get<any>("/reviews/venue", { params });
    return response.data.data;
  },

  replyToVenueReview: async (reviewId: string, replyComment: string): Promise<ReviewDetail> => {
    const response = await api.put<any>(`/reviews/venue/${reviewId}/reply`, {
      reply_comment: replyComment
    });
    return response.data.data;
  },

  getPublicVenueReviews: async (venueId: string, params: {
    rating?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ReviewSummaryResponse> => {
    const response = await api.get<any>(`/reviews/public/venue/${venueId}`, { params });
    return response.data.data;
  }
};
