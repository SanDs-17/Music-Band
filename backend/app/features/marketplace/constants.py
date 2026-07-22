"""
Constants and geographical reference datasets for Marketplace Search & Discovery.
Supports India states, union territories, popular cities, and extensible country models.
"""

# Popular Indian Cities for quick marketplace selection
POPULAR_CITIES = [
    "Mumbai",
    "Delhi NCR",
    "Bengaluru",
    "Chennai",
    "Hyderabad",
    "Kolkata",
    "Pune",
    "Goa",
    "Jaipur",
    "Ahmedabad",
]

# All 28 States of India
INDIAN_STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
]

# All 8 Union Territories of India
UNION_TERRITORIES = [
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
]

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
DEFAULT_SORT_BY = "best_match"
DEFAULT_SORT_ORDER = "desc"

# Curated popular/trending search terms for Marketplace Phase 4
POPULAR_SEARCHES = [
    {"label": "Wedding Bands", "query": "wedding bands", "category": "event_type"},
    {"label": "DJ", "query": "DJ", "category": "genre"},
    {"label": "Classical Music", "query": "classical music", "category": "genre"},
    {"label": "Bollywood Singers", "query": "bollywood", "category": "genre"},
    {"label": "Jazz Band", "query": "jazz", "category": "genre"},
    {"label": "Corporate Events", "query": "corporate event", "category": "event_type"},
    {"label": "Banquet Halls", "query": "banquet", "category": "event_type"},
    {"label": "Mumbai Artists", "query": "mumbai", "category": "city"},
    {"label": "Chennai", "query": "chennai", "category": "city"},
    {"label": "Luxury Venues", "query": "luxury venue", "category": "event_type"},
]

# ─── Phase 5: Smart Ranking & Availability Constants ────────────────────────

# Deterministic Search Score Weights (Max total score: 205)
RANKING_WEIGHTS = {
    "exact_match": 50,
    "category_match": 25,
    "location_match": 20,
    "verified": 15,
    "featured": 15,
    "average_rating": 15,
    "popularity": 10,
    "availability": 20,
    "profile_completeness": 10,
    "recent_activity": 5,
}

SORT_OPTIONS = [
    {"label": "Best Match", "value": "best_match", "order": "desc"},
    {"label": "Highest Rated", "value": "rating", "order": "desc"},
    {"label": "Most Popular", "value": "popularity", "order": "desc"},
    {"label": "Most Booked", "value": "booked", "order": "desc"},
    {"label": "Most Reviewed", "value": "reviews", "order": "desc"},
    {"label": "Newest", "value": "created_at", "order": "desc"},
    {"label": "Oldest", "value": "created_at", "order": "asc"},
    {"label": "Price: Low to High", "value": "price", "order": "asc"},
    {"label": "Price: High to Low", "value": "price", "order": "desc"},
    {"label": "Availability", "value": "availability", "order": "desc"},
    {"label": "Alphabetical", "value": "name", "order": "asc"},
]

AVAILABILITY_FILTERS = [
    {"label": "All Availability", "value": "all"},
    {"label": "Available Today", "value": "today"},
    {"label": "Available Tomorrow", "value": "tomorrow"},
    {"label": "Available This Week", "value": "this_week"},
    {"label": "Available On Date", "value": "custom"},
]
