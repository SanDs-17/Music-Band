import { api } from "./api";
import { BookingRequestDetail, BookingsListResponse } from "@/types/booking";

export const bookingService = {
  getArtistBookings: async (params: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<BookingsListResponse> => {
    const response = await api.get<any>("/bookings/artist", { params });
    return response.data.data;
  },

  getBookingDetails: async (bookingId: string): Promise<BookingRequestDetail> => {
    const response = await api.get<any>(`/bookings/${bookingId}`);
    return response.data.data;
  },

  acceptBooking: async (bookingId: string): Promise<BookingRequestDetail> => {
    const response = await api.put<any>(`/bookings/${bookingId}/accept`);
    return response.data.data;
  },

  rejectBooking: async (bookingId: string): Promise<BookingRequestDetail> => {
    const response = await api.put<any>(`/bookings/${bookingId}/reject`);
    return response.data.data;
  },

  counterOffer: async (
    bookingId: string,
    counterPrice: number,
    message?: string
  ): Promise<BookingRequestDetail> => {
    const response = await api.put<any>(`/bookings/${bookingId}/counter`, {
      counter_price: counterPrice,
      message
    });
    return response.data.data;
  },

  cancelBooking: async (bookingId: string): Promise<BookingRequestDetail> => {
    const response = await api.put<any>(`/bookings/${bookingId}/cancel`);
    return response.data.data;
  },
};
