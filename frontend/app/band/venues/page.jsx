"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import bandApi from "../../../lib/bandApi";
import { getBandUser, isBandAuthenticated } from "../../../lib/bandAuth";

export default function BandVenuesPage() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isBandAuthenticated()) setUser(getBandUser());
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");

    const fetchVenues = async () => {
      try {
        const response = await bandApi.get("/venues", {
          params: { search, limit: 24, offset: 0 },
        });
        setVenues(response.data?.items || []);
      } catch {
        setError("Unable to load venues. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [search]);

  return (
    <div className="band-section">
      <div className="band-section__head">
        <div>
          <h1 className="band-section__title">Find venues for your event</h1>
          <p style={{ color: "rgba(244, 244, 245, 0.65)", marginTop: 6 }}>
            Search verified venues with capacity, pricing, and amenities suited
            for live gigs and private events.
          </p>
        </div>
      </div>

      <form
        className="band-search"
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(query.trim());
        }}
      >
        <input
          className="band-field__input"
          placeholder="Search by venue name, city, or feature"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button className="band-btn band-btn--primary" type="submit">
          Search
        </button>
      </form>

      {loading ? (
        <div className="band-loading">Loading venues…</div>
      ) : error ? (
        <div className="band-error">{error}</div>
      ) : (
        <div
          className="band-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          {venues.length === 0 ? (
            <div className="band-empty">
              No venues found. Try a broader search or check back later.
            </div>
          ) : (
            venues.map((venue) => (
              <Link
                key={venue.id}
                href={`/band/venues/${venue.id}`}
                className="band-card"
              >
                <div className="band-card__title">{venue.name}</div>
                <div className="band-card__meta">{venue.address}</div>
                <div className="band-card__meta" style={{ marginTop: 10 }}>
                  Capacity: {venue.capacity ?? "N/A"}
                </div>
                <div className="band-card__price">
                  ₹{venue.base_price?.toFixed(0) ?? 0}
                </div>
                <div className="band-card__meta">
                  {venue.categories?.slice(0, 3).join(" • ")}
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {user ? null : (
        <div className="band-section" style={{ marginTop: 24 }}>
          <div className="band-card">
            <div className="band-card__title">Book venues faster</div>
            <p style={{ color: "rgba(244, 244, 245, 0.55)", lineHeight: 1.6 }}>
              Login or register to request bookings, save favorites, and manage
              venue conversations from your dashboard.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 12,
              }}
            >
              <Link href="/band/login" className="band-btn band-btn--ghost">
                Login
              </Link>
              <Link href="/band/register" className="band-btn band-btn--cyan">
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
