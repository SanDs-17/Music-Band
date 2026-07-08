export interface ClientBrief {
  id: string;
  name: string;
  email: string;
}

export interface TimelineItem {
  status: string;
  timestamp: string;
  by: string;
  message: string;
}

export interface BookingRequestDetail {
  id: string;
  event_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  proposed_price: number;
  counter_price: number | null;
  status: "pending" | "counter_offered" | "accepted" | "rejected" | "cancelled";
  location: string;
  notes: string | null;
  client: ClientBrief;
  timeline: TimelineItem[];
  created_at: string;
  updated_at: string;
}

export interface BookingsListResponse {
  bookings: BookingRequestDetail[];
  total: number;
  page: number;
  limit: number;
}
