import { create } from "zustand";
import {
  Review,
  CreateReviewPayload,
  UpdateReviewPayload,
  ReviewFiltersPayload,
  ReviewEligibility
} from "@/types/review";
import { reviewService } from "@/services/reviewService";

interface ReviewStoreState {
  reviews: Review[];
  selectedReview: Review | null;
  loading: boolean;
  error: string | null;
  filters: ReviewFiltersPayload;
  eligibilityMap: Record<string, ReviewEligibility>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };

  // Actions
  fetchReviews: (customFilters?: ReviewFiltersPayload) => Promise<void>;
  fetchReviewById: (id: string) => Promise<Review | null>;
  createReview: (payload: CreateReviewPayload) => Promise<Review | null>;
  updateReview: (id: string, payload: UpdateReviewPayload) => Promise<Review | null>;
  deleteReview: (id: string) => Promise<boolean>;
  checkEligibility: (bookingId: string, targetUserId?: string) => Promise<ReviewEligibility | null>;
  setFilters: (filters: Partial<ReviewFiltersPayload>) => void;
  resetFilters: () => void;
  setSelectedReview: (review: Review | null) => void;
}

const initialFilters: ReviewFiltersPayload = {
  page: 1,
  limit: 20,
  sort_by: "created_at",
  sort_order: "desc"
};

export const useReviewStore = create<ReviewStoreState>((set, get) => ({
  reviews: [],
  selectedReview: null,
  loading: false,
  error: null,
  filters: initialFilters,
  eligibilityMap: {},
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  },

  fetchReviews: async (customFilters?: ReviewFiltersPayload) => {
    const activeFilters = { ...get().filters, ...customFilters };
    set({ loading: true, error: null, filters: activeFilters });
    try {
      const data = await reviewService.listReviews(activeFilters);
      set({
        reviews: data.items,
        pagination: data.pagination,
        loading: false
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch reviews.",
        loading: false
      });
    }
  },

  fetchReviewById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const review = await reviewService.getReview(id);
      set({ selectedReview: review, loading: false });
      return review;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch review.",
        loading: false
      });
      return null;
    }
  },

  createReview: async (payload: CreateReviewPayload) => {
    set({ loading: true, error: null });
    try {
      const created = await reviewService.createReview(payload);
      set((state) => ({
        reviews: [created, ...state.reviews],
        loading: false
      }));
      // If linked to booking, update eligibility cache
      if (payload.booking_id) {
        set((state) => ({
          eligibilityMap: {
            ...state.eligibilityMap,
            [payload.booking_id!]: {
              eligible: false,
              booking_id: payload.booking_id!,
              reviewer_id: created.reviewer_id || "",
              already_reviewed: true,
              reason: "You have already submitted a review for this booking."
            }
          }
        }));
      }
      return created;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to create review.",
        loading: false
      });
      return null;
    }
  },

  updateReview: async (id: string, payload: UpdateReviewPayload) => {
    set({ loading: true, error: null });
    try {
      const updated = await reviewService.updateReview(id, payload);
      set((state) => ({
        reviews: state.reviews.map((r) => (r.id === id ? updated : r)),
        selectedReview: state.selectedReview?.id === id ? updated : state.selectedReview,
        loading: false
      }));
      return updated;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to update review.",
        loading: false
      });
      return null;
    }
  },

  deleteReview: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await reviewService.deleteReview(id);
      set((state) => ({
        reviews: state.reviews.filter((r) => r.id !== id),
        selectedReview: state.selectedReview?.id === id ? null : state.selectedReview,
        loading: false
      }));
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to delete review.",
        loading: false
      });
      return false;
    }
  },

  checkEligibility: async (bookingId: string, targetUserId?: string) => {
    try {
      const eligibility = await reviewService.checkEligibility(bookingId, targetUserId);
      set((state) => ({
        eligibilityMap: {
          ...state.eligibilityMap,
          [bookingId]: eligibility
        }
      }));
      return eligibility;
    } catch (err: any) {
      return null;
    }
  },

  setFilters: (newFilters: Partial<ReviewFiltersPayload>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: newFilters.page ?? 1 }
    }));
  },

  resetFilters: () => {
    set({ filters: initialFilters });
  },

  setSelectedReview: (review: Review | null) => {
    set({ selectedReview: review });
  }
}));
