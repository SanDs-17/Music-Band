"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import bandApi from "../../../../lib/bandApi";

export default function BandVenueDetailPage({ params }) {
  const router = useRouter();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const response = await bandApi.get(`/venues/${params.id}`);
        setVenue(response.data);
      } catch {
        setError("Venue not found or could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [params.id]);

  if (loading) {
    return <div className="band-loading">Loading venue…</div>;
  }

  if (error) {
    return <div className="band-error">{error}</div>;
  }

  return (
    <div className="band-section">
      <div className="band-section__head">
        <div>
          <h1 className="band-section__title">{venue.name}</h1>
          <p style={{ color: "rgba(244, 244, 245, 0.65)", marginTop: 6 }}>
            {venue.address}
          </p>
        </div>
      </div>

      <div className="band-grid" style={{ gridTemplateColumns: "1fr" }}>
        <div className="band-card">
          <div className="band-card__meta">
            Capacity: {venue.capacity ?? "N/A"}
          </div>
          <div className="band-card__meta" style={{ marginTop: 8 }}>
            Price: ₹{venue.base_price?.toFixed(0) ?? 0}
          </div>
          <div
            style={{
              marginTop: 16,
              color: "rgba(244, 244, 245, 0.8)",
              lineHeight: 1.8,
            }}
          >
            {venue.description || "No description available."}
          </div>
          {venue.gallery?.length ? (
            <div style={{ marginTop: 18 }}>
              <h2 className="band-card__title" style={{ fontSize: 18 }}>
                Gallery
              </h2>
              <div
                className="band-grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: 12,
                }}
              >
                {venue.gallery.map((item, index) => (
                  <img
                    key={index}
                    src={item}
                    alt={`Venue ${index + 1}`}
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      objectFit: "cover",
                      minHeight: 120,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <button
        className="band-btn band-btn--ghost"
        onClick={() => router.back()}
      >
        Back to venues
      </button>
    </div>
  );
}
