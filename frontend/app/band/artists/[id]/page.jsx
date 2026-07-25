"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import bandApi from "../../../../lib/bandApi";

export default function BandArtistDetailPage({ params }) {
  const router = useRouter();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await bandApi.get(`/artists/${params.id}`);
        setArtist(response.data);
      } catch {
        setError("Artist not found or could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [params.id]);

  if (loading) {
    return <div className="band-loading">Loading artist…</div>;
  }

  if (error) {
    return <div className="band-error">{error}</div>;
  }

  return (
    <div className="band-section">
      <div className="band-section__head">
        <div>
          <h1 className="band-section__title">
            {artist.display_name || "Artist"}
          </h1>
          <p style={{ color: "rgba(244, 244, 245, 0.65)", marginTop: 6 }}>
            {artist.band_type || "Performer"} · ₹
            {artist.base_rate?.toFixed(0) ?? 0}/hr
          </p>
        </div>
      </div>

      <div className="band-grid" style={{ gridTemplateColumns: "1fr" }}>
        <div className="band-card">
          <div className="band-card__meta">
            Genres: {artist.genres?.join(" • ") || "Not available"}
          </div>
          <div className="band-card__meta" style={{ marginTop: 8 }}>
            Rating: {artist.rating?.toFixed(1) ?? "5.0"}
          </div>
          <div
            style={{
              marginTop: 16,
              color: "rgba(244, 244, 245, 0.8)",
              lineHeight: 1.8,
            }}
          >
            {artist.bio || "No biography available."}
          </div>
          {artist.gallery?.length ? (
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
                {artist.gallery.map((item, index) => (
                  <img
                    key={index}
                    src={item}
                    alt={`Gallery ${index + 1}`}
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
        Back to artists
      </button>
    </div>
  );
}
