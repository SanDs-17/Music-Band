import { api } from "./api";
import { ArtistRegisterFormData, ArtistProfileUpdateFormData } from "@/utils/validation";
import { ArtistProfile, ArtistDashboardData, AvailabilityData, MediaGalleryData, PricingData } from "@/types/artist";
import { ArtistAnalytics } from "@/types/analytics";

export const artistService = {
  register: async (data: ArtistRegisterFormData): Promise<ArtistProfile> => {
    // Restructure password/confirmPassword and terms fields as needed
    // The backend ArtistRegisterRequest accepts password but not confirmPassword or acceptTerms
    const { confirmPassword, acceptTerms, ...payload } = data;
    const response = await api.post<any>("/artists/register", payload);
    return response.data.data;
  },

  getDashboardStats: async (): Promise<ArtistDashboardData> => {
    const response = await api.get<any>("/artists/me/dashboard");
    return response.data.data;
  },

  getProfile: async (): Promise<ArtistProfile> => {
    const response = await api.get<any>("/artists/me");
    return response.data.data;
  },

  updateProfile: async (data: ArtistProfileUpdateFormData): Promise<ArtistProfile> => {
    const response = await api.put<any>("/artists/me", data);
    return response.data.data;
  },

  getAvailability: async (): Promise<AvailabilityData> => {
    const response = await api.get<any>("/artists/me/availability");
    return response.data.data;
  },

  updateAvailability: async (data: AvailabilityData): Promise<AvailabilityData> => {
    const response = await api.put<any>("/artists/me/availability", data);
    return response.data.data;
  },

  checkConflict: async (date: string, startTime: string, endTime: string): Promise<{ has_conflict: boolean; reason: string | null }> => {
    const response = await api.post<any>("/artists/me/availability/check-conflict", {
      date,
      start_time: startTime,
      end_time: endTime
    });
    return response.data.data;
  },

  getMedia: async (): Promise<MediaGalleryData> => {
    const response = await api.get<any>("/artists/me/media");
    return response.data.data;
  },

  updateMedia: async (data: MediaGalleryData): Promise<MediaGalleryData> => {
    const response = await api.put<any>("/artists/me/media", data);
    return response.data.data;
  },

  getPricing: async (): Promise<PricingData> => {
    const response = await api.get<any>("/artists/me/pricing");
    return response.data.data;
  },

  updatePricing: async (data: PricingData): Promise<PricingData> => {
    const response = await api.put<any>("/artists/me/pricing", data);
    return response.data.data;
  },

  getAnalytics: async (): Promise<ArtistAnalytics> => {
    const response = await api.get<any>("/artists/me/analytics");
    return response.data.data;
  }
};
