import { MarketplaceVenueCard, VenuePreviewResponse } from "@/features/marketplace/types";

export function testVenueCardContractValidation() {
  const mockVenueCard: MarketplaceVenueCard = {
    id: "ven-101",
    user_id: "usr-202",
    name: "Golden Oak Banquet Hall",
    venue_number: "BCV-100001",
    venue_type: "Banquet Hall",
    description: "An elegant space perfect for weddings and corporate gatherings.",
    address: "123 Residency Road",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    base_price: 75000,
    capacity: 500,
    min_capacity: 100,
    rating: 4.8,
    total_reviews: 12,
    image: "/uploads/venue-101.jpg",
    gallery: ["/uploads/venue-101.jpg", "/uploads/venue-101-lobby.jpg"],
    facilities: ["Air Conditioning", "Valet Parking", "AV Setup"],
    categories: [],
    verification_status: "approved",
    is_featured: true,
    availability_status: "Available",
    created_at: "2026-07-21T12:00:00Z"
  };

  console.assert(mockVenueCard.id === "ven-101", "Venue ID mismatch");
  console.assert(mockVenueCard.capacity === 500, "Capacity mismatch");
  console.assert(mockVenueCard.base_price === 75000, "Price mismatch");
  console.assert(mockVenueCard.is_featured === true, "Featured status mismatch");
}

export function testVenuePreviewContractValidation() {
  const mockVenuePreview: VenuePreviewResponse = {
    id: "ven-101",
    user_id: "usr-202",
    name: "Golden Oak Banquet Hall",
    venue_number: "BCV-100001",
    venue_type: "Banquet Hall",
    description: "An elegant space perfect for weddings.",
    address: "123 Residency Road",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    base_price: 75000,
    capacity: 500,
    min_capacity: 100,
    rating: 4.8,
    total_reviews: 12,
    image: "/uploads/venue-101.jpg",
    gallery: ["/uploads/venue-101.jpg"],
    facilities: ["AV Setup"],
    categories: [],
    pricing_details: { rent_price: 75000, caution_deposit: 15000 },
    availability_rules: { weekdays: "9am-10pm" },
    verification_status: "approved",
    is_featured: true,
    availability_indicator: "Open for booking",
    created_at: "2026-07-21T12:00:00Z"
  };

  console.assert(mockVenuePreview.id === "ven-101", "Venue ID mismatch");
  console.assert(mockVenuePreview.availability_indicator === "Open for booking", "Indicator mismatch");
  console.assert(mockVenuePreview.pricing_details.rent_price === 75000, "Pricing details mismatch");
}
