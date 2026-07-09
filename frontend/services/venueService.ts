import { api } from "./api";
import { VenueRegisterFormData, VenueProfileUpdateFormData } from "@/utils/validation";
import { VenueResponseData, VenueDashboardData, VenueMediaData, VenueAvailabilityData, VenueConflictCheckRequest, VenueConflictCheckResponse, VenueFacilitiesData, VenuePricingData, VenueAnalyticsData, VenueDocumentsResubmitData, VenueSettingsData } from "@/types/venue";


export const venueService = {
  register: async (data: VenueRegisterFormData): Promise<VenueResponseData> => {
    // Confirm password and acceptTerms do not belong to the API payload
    const { confirmPassword, acceptTerms, ...payload } = data;
    const response = await api.post<any>("/venues/register", payload);
    return response.data.data;
  },

  getDashboardStats: async (): Promise<VenueDashboardData> => {
    const response = await api.get<any>("/venues/me/dashboard");
    return response.data.data;
  },

  getProfile: async (): Promise<VenueResponseData> => {
    const response = await api.get<any>("/venues/me");
    return response.data.data;
  },

  updateProfile: async (data: VenueProfileUpdateFormData): Promise<VenueResponseData> => {
    const response = await api.put<any>("/venues/me", data);
    return response.data.data;
  },

  getMedia: async (): Promise<VenueMediaData> => {
    const response = await api.get<any>("/venues/me/media");
    return response.data.data;
  },

  updateMedia: async (data: VenueMediaData): Promise<VenueMediaData> => {
    const response = await api.put<any>("/venues/me/media", data);
    return response.data.data;
  },

  getAvailability: async (): Promise<VenueAvailabilityData> => {
    const response = await api.get<any>("/venues/me/availability");
    return response.data.data;
  },

  updateAvailability: async (data: Omit<VenueAvailabilityData, "bookings">): Promise<VenueAvailabilityData> => {
    const response = await api.put<any>("/venues/me/availability", data);
    return response.data.data;
  },

  checkConflict: async (data: VenueConflictCheckRequest): Promise<VenueConflictCheckResponse> => {
    const response = await api.post<any>("/venues/me/availability/check-conflict", data);
    return response.data.data;
  },

  getFacilities: async (): Promise<VenueFacilitiesData> => {
    const response = await api.get<any>("/venues/me/facilities");
    return response.data.data;
  },

  updateFacilities: async (data: VenueFacilitiesData): Promise<VenueFacilitiesData> => {
    const response = await api.put<any>("/venues/me/facilities", data);
    return response.data.data;
  },

  getPricing: async (): Promise<VenuePricingData> => {
    const response = await api.get<any>("/venues/me/pricing");
    return response.data.data;
  },

  updatePricing: async (data: VenuePricingData): Promise<VenuePricingData> => {
    const response = await api.put<any>("/venues/me/pricing", data);
    return response.data.data;
  },

  getAnalytics: async (): Promise<VenueAnalyticsData> => {
    const response = await api.get<any>("/venues/me/analytics");
    return response.data.data;
  },

  resubmitVerificationDocuments: async (data: VenueDocumentsResubmitData): Promise<VenueResponseData> => {
    const response = await api.put<any>("/venues/me/verification/resubmit", data);
    return response.data.data;
  },

  updateVenueSettings: async (data: VenueSettingsData): Promise<VenueResponseData> => {
    const response = await api.put<any>("/venues/me/settings", data);
    return response.data.data;
  },

  getPublicVenueDetail: async (id: string): Promise<VenueResponseData> => {
    const response = await api.get<any>(`/venues/${id}`);
    return response.data.data;
  }
};
