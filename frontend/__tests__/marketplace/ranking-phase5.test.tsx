import {
  SearchScore,
  AvailabilityStatus,
  PopularityMetrics,
  ProfileCompletion,
  SmartBadge,
  MarketplaceRankingResponse,
} from "@/features/marketplace/types";

export function testPhase5SearchScoreContract() {
  const mockScore: SearchScore = {
    total_score: 142.5,
    match_score: 50,
    category_score: 25,
    location_score: 20,
    verification_score: 15,
    featured_score: 15,
    rating_score: 12,
    popularity_score: 8,
    availability_score: 20,
    completeness_score: 8,
    recency_score: 5,
  };

  console.assert(mockScore.total_score === 142.5, "Total score mismatch");
  console.assert(mockScore.match_score === 50, "Match score mismatch");
}

export function testPhase5AvailabilityStatusContract() {
  const mockAvailability: AvailabilityStatus = {
    status: "available_today",
    is_available: true,
    indicator_label: "Available Today",
  };

  console.assert(mockAvailability.status === "available_today", "Availability status mismatch");
  console.assert(mockAvailability.is_available === true, "Availability flag mismatch");
}

export function testPhase5PopularityMetricsContract() {
  const mockPopularity: PopularityMetrics = {
    total_bookings: 12,
    total_reviews: 8,
    average_rating: 4.9,
    popularity_score: 85,
    popularity_level: "Highly Booked",
  };

  console.assert(mockPopularity.popularity_level === "Highly Booked", "Popularity level mismatch");
}

export function testPhase5SmartBadgeRenderingKeys() {
  const badges: SmartBadge[] = [
    { key: "verified", label: "Verified", variant: "success" },
    { key: "available_today", label: "Available Today", variant: "info" },
    { key: "top_rated", label: "Top Rated", variant: "purple" },
  ];

  console.assert(badges.length === 3, "Badge count mismatch");
  console.assert(badges.some((b) => b.key === "available_today"), "Availability badge missing");
}

export function testPhase5RankingResponseContract() {
  const mockResponse: MarketplaceRankingResponse = {
    query: "jazz",
    total: 1,
    items: [
      {
        entity_type: "artist",
        id: "art-1",
        display_name: "Jazz Collective",
        rating: 4.8,
        base_price: 50000,
        currency: "INR",
        tags: ["Jazz"],
        verification_status: "approved",
        search_score: {
          total_score: 120,
          match_score: 35,
          category_score: 25,
          location_score: 10,
          verification_score: 15,
          featured_score: 0,
          rating_score: 14,
          popularity_score: 6,
          availability_score: 20,
          completeness_score: 8,
          recency_score: 5,
        },
      },
    ],
    pagination: { total: 1, page: 1, limit: 12, pages: 1 },
  };

  console.assert(mockResponse.items[0].search_score?.total_score === 120, "Ranking item score mismatch");
}

export function testPhase5AvailabilityFilterOptions() {
  const filters = ["all", "today", "tomorrow", "this_week", "custom"] as const;
  console.assert(filters.includes("today"), "Today filter option missing");
  console.assert(filters.includes("this_week"), "This week filter option missing");
}

export function testPhase5ProfileCompletionContract() {
  const mockProfile: ProfileCompletion = {
    percentage: 75,
    missing_fields: ["gallery", "social_links"],
    is_complete: false,
  };

  console.assert(mockProfile.percentage === 75, "Profile percentage mismatch");
  console.assert(mockProfile.is_complete === false, "Profile complete flag mismatch");
}
