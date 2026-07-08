import { api } from "./api";
import { VenueRegisterFormData } from "@/utils/validation";
import { VenueResponseData } from "@/types/venue";

export const venueService = {
  register: async (data: VenueRegisterFormData): Promise<VenueResponseData> => {
    // Confirm password and acceptTerms do not belong to the API payload
    const { confirmPassword, acceptTerms, ...payload } = data;
    const response = await api.post<any>("/venues/register", payload);
    return response.data.data;
  }
};
