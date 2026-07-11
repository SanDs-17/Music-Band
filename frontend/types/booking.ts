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
  status: "pending" | "counter_offered" | "accepted" | "rejected" | "cancelled" | "completed";
  location: string;
  notes: string | null;
  client: ClientBrief;
  timeline: TimelineItem[];
  booking_notes: any[];
  timeline_events: any[];
  event_title?: string;
  event_type?: string;
  duration?: number;
  guest_count?: number;
  budget?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  google_maps_coords?: string | null;
  special_requests?: string | null;
  venue_id?: string | null;
  artist_profile_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingsListResponse {
  bookings: BookingRequestDetail[];
  total: number;
  page: number;
  limit: number;
}

export interface BookingTimelineEvent {
  id: string;
  booking_id: string;
  event_type: string;
  status: string;
  message: string;
  created_by_id?: string | null;
  created_by_role: string;
  created_at: string;
  updated_at: string;
}
