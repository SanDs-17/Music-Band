import { api } from "./api";
import {
  Review,
  CreateReviewPayload,
  UpdateReviewPayload,
  ReviewFiltersPayload,
  ReviewPaginatedResponse,
  ReviewSummaryResponse,
  ReviewDetail
} from "@/types/review";
import { isPreviewActive, toastMutationBlocked } from "@/utils/dev-mode";
import { mockReviewsResponse } from "@/utils/preview-fixtures";

export const reviewService = {
  createReview: async (payload: CreateReviewPayload): Promise<Review> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.post<any>("/reviews", payload);
    return response.data.data;
  },

  updateReview: async (id: string, payload: UpdateReviewPayload): Promise<Review> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.put<any>(`/reviews/${id}`, payload);
    return response.data.data;
  },

  deleteReview: async (id: string): Promise<Review> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.delete<any>(`/reviews/${id}`);
    return response.data.data;
  },

  getReview: async (id: string): Promise<Review> => {
    if (isPreviewActive()) {
      return Promise.resolve({
        id,
        rating: 5,
        review_title: "Excellent Gigs",
        review_text: "Wonderful experience",
        comment: "Wonderful experience",
        is_public: true,
        images: [],
        videos: [],
        created_at: new Date().toISOString()
      } as Review);
    }
    const response = await api.get<any>(`/reviews/${id}`);
    return response.data.data;
  },

  listReviews: async (params?: ReviewFiltersPayload): Promise<ReviewPaginatedResponse> => {
    if (isPreviewActive()) {
      const items = (mockReviewsResponse.reviews || []).map((r) => ({
        id: r.id,
        rating: r.rating,
        review_text: r.comment,
        comment: r.comment,
        is_public: true,
        reply_comment: r.reply_comment,
        reply_at: r.reply_at,
        images: r.images || [],
        videos: r.videos || [],
        client: r.client,
        created_at: r.created_at
      })) as Review[];
      return Promise.resolve({
        items,
        pagination: { total: items.length, page: 1, limit: 20, pages: 1 }
      });
    }
    const response = await api.get<any>("/reviews", { params });
    return response.data.data;
  },

  getBookingReviews: async (bookingId: string): Promise<Review[]> => {
    if (isPreviewActive()) return Promise.resolve([]);
    const response = await api.get<any>(`/reviews/booking/${bookingId}`);
    return response.data.data;
  },

  getArtistReviews: async (params: {
    rating?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ReviewSummaryResponse> => {
    if (isPreviewActive()) return Promise.resolve(mockReviewsResponse);
    const response = await api.get<any>("/reviews/artist", { params });
    return response.data.data;
  },

  replyToReview: async (reviewId: string, replyComment: string): Promise<ReviewDetail> => {
    if (isPreviewActive()) return toastMutationBlocked();
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
    if (isPreviewActive()) return Promise.resolve(mockReviewsResponse);
    const response = await api.get<any>("/reviews/venue", { params });
    return response.data.data;
  },

  replyToVenueReview: async (reviewId: string, replyComment: string): Promise<ReviewDetail> => {
    if (isPreviewActive()) return toastMutationBlocked();
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
    if (isPreviewActive()) return Promise.resolve(mockReviewsResponse);
    const response = await api.get<any>(`/reviews/public/venue/${venueId}`, { params });
    return response.data.data;
  },

  checkEligibility: async (bookingId: string, targetUserId?: string): Promise<any> => {
    if (isPreviewActive()) {
      return Promise.resolve({
        eligible: true,
        booking_id: bookingId,
        reviewer_id: "preview-user",
        already_reviewed: false
      });
    }
    const response = await api.get<any>(`/reviews/eligibility/${bookingId}`, {
      params: { target_user_id: targetUserId }
    });
    return response.data.data;
  },

  getMyReviews: async (params?: { page?: number; limit?: number }): Promise<ReviewPaginatedResponse> => {
    if (isPreviewActive()) {
      return Promise.resolve({
        items: [],
        pagination: { total: 0, page: 1, limit: 20, pages: 0 }
      });
    }
    const response = await api.get<any>("/reviews/me", { params });
    return response.data.data;
  },

  getUserReviews: async (userId: string, params?: { page?: number; limit?: number }): Promise<ReviewPaginatedResponse> => {
    if (isPreviewActive()) {
      return Promise.resolve({
        items: [],
        pagination: { total: 0, page: 1, limit: 20, pages: 0 }
      });
    }
    const response = await api.get<any>(`/reviews/user/${userId}`, { params });
    return response.data.data;
  }
};
