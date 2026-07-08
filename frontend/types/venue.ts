export interface VenueBrief {
  id: string;
  name: string;
  city_id: string;
}

export interface VenueResponseData {
  id: string;
  user_id: string;
  name: string;
  venue_type: string;
  business_name: string | null;
  contact_details: string | null;
  description: string | null;
  address: string;
  city_id: string;
  min_capacity: number;
  capacity: number;
  base_price: number;
  pincode: string | null;
  state: string | null;
  country: string | null;
  google_map_location: string | null;
  facilities: string[];
  gallery: string[];
  pricing_details: Record<string, any>;
  availability_rules: Record<string, any>;
  created_at: string;
}
