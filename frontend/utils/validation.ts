import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role_name: z.enum(["client", "artist", "venue_owner"]),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters long"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const artistRegisterSchema = z.object({
  // Step 1: Account
  email: z.string().email("Invalid email address"),
  mobile_number: z.string().min(10, "Mobile number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters long"),
  
  // Step 2: Basic
  name: z.string().min(2, "Band / Artist Name must be at least 2 characters"),
  display_name: z.string().min(2, "Display name must be at least 2 characters"),
  description: z.string().max(2000, "Description cannot exceed 2000 characters").optional().default(""),
  years_of_experience: z.number().min(0, "Years of experience cannot be negative").default(0),
  profile_image: z.string().optional().default(""),
  cover_image: z.string().optional().default(""),

  // Step 3: Band Details
  band_type: z.enum(["Solo", "Duo", "Trio", "4 Members", "5+ Members"]).default("Solo"),
  total_members: z.number().min(1, "Must have at least 1 member").default(1),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  genres: z.array(z.string()).min(1, "Select at least one genre"),

  // Step 4: Pricing
  base_rate: z.number().min(0, "Rate cannot be negative").default(0),
  currency: z.string().min(1, "Currency is required").default("INR"),
  travel_radius: z.number().min(0, "Radius cannot be negative").default(0),
  travel_charges: z.number().min(0, "Travel charges cannot be negative").default(0),
  min_booking_hours: z.number().min(0, "Minimum hours cannot be negative").default(0),
  max_booking_hours: z.number().min(0, "Maximum hours cannot be negative").default(0),

  // Step 5: Equipment
  equipment: z.object({
    own_speaker: z.boolean().default(false),
    mic: z.boolean().default(false),
    mixer: z.boolean().default(false),
    keyboard: z.boolean().default(false),
    guitar: z.boolean().default(false),
    drums: z.boolean().default(false),
    lighting: z.boolean().default(false),
    dj_console: z.boolean().default(false),
  }).default({}),

  // Step 6: Media
  gallery: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
  youtube_links: z.array(z.string()).default([]),

  // Step 7: Availability
  availability: z.object({
    weekly_schedule: z.record(z.string(), z.object({
      available: z.boolean().default(false),
      start: z.string().default("09:00"),
      end: z.string().default("22:00")
    })).default({}),
    holidays: z.array(z.string()).default([]),
    blocked_dates: z.array(z.string()).default([]),
  }).default({}),

  // Step 8: Terms
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ArtistRegisterFormData = z.infer<typeof artistRegisterSchema>;

export const artistProfileUpdateSchema = z.object({
  name: z.string().min(2, "Band / Artist Name must be at least 2 characters"),
  display_name: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().max(2000, "Bio cannot exceed 2000 characters").optional().default(""),
  years_of_experience: z.number().min(0, "Experience cannot be negative").default(0),
  profile_image: z.string().optional().default(""),
  cover_image: z.string().optional().default(""),
  mobile_number: z.string().min(10, "Mobile number must be at least 10 digits"),
  band_type: z.enum(["Solo", "Duo", "Trio", "4 Members", "5+ Members"]).default("Solo"),
  total_members: z.number().min(1, "Must have at least 1 member").default(1),
  base_rate: z.number().min(0, "Rate cannot be negative").default(0),
  currency: z.string().min(1, "Currency is required").default("INR"),
  travel_radius: z.number().min(0, "Radius cannot be negative").default(0),
  travel_charges: z.number().min(0, "Charges cannot be negative").default(0),
  min_booking_hours: z.number().min(0, "Minimum hours cannot be negative").default(0),
  max_booking_hours: z.number().min(0, "Maximum hours cannot be negative").default(0),
  equipment: z.object({
    own_speaker: z.boolean().default(false),
    mic: z.boolean().default(false),
    mixer: z.boolean().default(false),
    keyboard: z.boolean().default(false),
    guitar: z.boolean().default(false),
    drums: z.boolean().default(false),
    lighting: z.boolean().default(false),
    dj_console: z.boolean().default(false),
  }).default({}),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  genres: z.array(z.string()).min(1, "Select at least one genre"),
  social_links: z.object({
    instagram: z.string().optional().default(""),
    facebook: z.string().optional().default(""),
    twitter: z.string().optional().default(""),
    website: z.string().optional().default(""),
  }).default({}),
  achievements: z.array(z.string()).default([]),
});

export type ArtistProfileUpdateFormData = z.infer<typeof artistProfileUpdateSchema>;


export const venueRegisterSchema = z.object({
  // Step 1: Owner Account
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters long"),

  // Step 2: Owner Details
  owner_name: z.string().min(2, "Owner Name must be at least 2 characters"),
  business_name: z.string().min(2, "Business Name must be at least 2 characters"),
  contact_person: z.string().optional().default(""),
  gst_number: z.string().optional().default(""),
  pan_number: z.string().optional().default(""),

  // Step 3: Venue Details
  venue_name: z.string().min(2, "Venue Name must be at least 2 characters"),
  venue_type: z.enum([
    "Marriage Hall",
    "Resort",
    "Hotel",
    "Banquet Hall",
    "Farm House",
    "Open Ground",
    "Club",
    "Pub",
    "Restaurant",
    "Others"
  ]),
  description: z.string().max(2000, "Description cannot exceed 2000 characters").optional().default(""),
  established_year: z.coerce.number().int().min(1800, "Invalid year").max(new Date().getFullYear(), "Year cannot be in the future").optional().nullable(),
  indoor_outdoor: z.enum(["Indoor", "Outdoor", "Both"]).default("Both"),

  // Step 4: Location
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().optional().default(""),
  city_id: z.string().uuid("City is required"),
  area: z.string().optional().default(""),
  address: z.string().min(5, "Address must be at least 5 characters"),
  landmark: z.string().optional().default(""),
  pincode: z.string().min(6, "Pincode must be at least 6 digits"),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  google_map_location: z.string().optional().default(""),

  // Step 5: Facilities
  facilities: z.array(z.string()).default([]),

  // Step 6: Capacity
  min_capacity: z.coerce.number().min(1, "Minimum capacity must be at least 1"),
  max_capacity: z.coerce.number().min(1, "Maximum capacity must be at least 1"),

  // Step 7: Pricing
  base_price: z.coerce.number().min(0, "Base price cannot be negative"),
  hourly_price: z.coerce.number().min(0, "Hourly price cannot be negative"),
  weekend_price: z.coerce.number().min(0, "Weekend price cannot be negative").optional().default(0),
  holiday_price: z.coerce.number().min(0, "Holiday price cannot be negative").optional().default(0),
  security_deposit: z.coerce.number().min(0, "Security deposit cannot be negative").optional().default(0),
  cancellation_charges: z.coerce.number().min(0, "Cancellation charges cannot be negative").optional().default(0),
  extra_hour_charges: z.coerce.number().min(0, "Extra hour charges cannot be negative").optional().default(0),

  // Step 8: Gallery
  cover_image: z.string().optional().default(""),
  images: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
  youtube_links: z.array(z.string()).default([]),
  virtual_tour: z.string().optional().default(""),

  // Step 9: Availability
  weekly_schedule: z.record(z.string(), z.object({
    available: z.boolean().default(false),
    start: z.string().default("09:00"),
    end: z.string().default("22:00")
  })).default({}),
  blocked_dates: z.array(z.string()).default([]),
  maintenance_days: z.array(z.string()).default([]),
  public_holidays: z.array(z.string()).default([]),
  booking_buffer_time: z.coerce.number().min(0).optional().default(0),

  // Step 10: Documents
  doc_pan: z.string().min(1, "PAN card document is required"),
  doc_gst: z.string().optional().default(""),
  doc_ownership_proof: z.string().min(1, "Ownership proof document is required"),
  doc_government_id: z.string().min(1, "Government ID is required"),
  doc_business_license: z.string().optional().default(""),

  // Step 11: Terms
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => data.max_capacity >= data.min_capacity, {
  message: "Maximum capacity must be greater than or equal to minimum capacity",
  path: ["max_capacity"],
});

export type VenueRegisterFormData = z.infer<typeof venueRegisterSchema>;


export const venueProfileUpdateSchema = z.object({
  // Owner Details
  owner_name: z.string().min(2, "Owner Name must be at least 2 characters"),
  business_name: z.string().min(2, "Business Name must be at least 2 characters"),
  contact_person: z.string().optional().default(""),
  gst_number: z.string().optional().default(""),
  pan_number: z.string().optional().default(""),

  // Venue Details
  venue_name: z.string().min(2, "Venue Name must be at least 2 characters"),
  venue_type: z.enum([
    "Marriage Hall",
    "Resort",
    "Hotel",
    "Banquet Hall",
    "Farm House",
    "Open Ground",
    "Club",
    "Pub",
    "Restaurant",
    "Others"
  ]),
  description: z.string().max(2000, "Description cannot exceed 2000 characters").optional().default(""),
  established_year: z.coerce.number().int().min(1800, "Invalid year").max(new Date().getFullYear(), "Year cannot be in the future").optional().nullable(),
  indoor_outdoor: z.enum(["Indoor", "Outdoor", "Both"]).default("Both"),

  // Location
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().optional().default(""),
  city_id: z.string().uuid("City is required"),
  area: z.string().optional().default(""),
  address: z.string().min(5, "Address must be at least 5 characters"),
  landmark: z.string().optional().default(""),
  pincode: z.string().min(6, "Pincode must be at least 6 digits"),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  google_map_location: z.string().optional().default(""),

  // Facilities
  facilities: z.array(z.string()).default([]),

  // Capacity
  min_capacity: z.coerce.number().min(1, "Minimum capacity must be at least 1"),
  max_capacity: z.coerce.number().min(1, "Maximum capacity must be at least 1"),

  // Availability
  weekly_schedule: z.record(z.string(), z.object({
    available: z.boolean().default(false),
    start: z.string().default("09:00"),
    end: z.string().default("22:00")
  })).default({}),
  blocked_dates: z.array(z.string()).default([]),
  maintenance_days: z.array(z.string()).default([]),
  public_holidays: z.array(z.string()).default([]),
  booking_buffer_time: z.coerce.number().min(0).optional().default(0),

  // Documents
  doc_pan: z.string().optional().default(""),
  doc_gst: z.string().optional().default(""),
  doc_ownership_proof: z.string().optional().default(""),
  doc_government_id: z.string().optional().default(""),
  doc_business_license: z.string().optional().default(""),

  youtube_links: z.array(z.string()).default([]),
}).refine((data) => data.max_capacity >= data.min_capacity, {
  message: "Maximum capacity must be greater than or equal to minimum capacity",
  path: ["max_capacity"],
});

export type VenueProfileUpdateFormData = z.infer<typeof venueProfileUpdateSchema>;



