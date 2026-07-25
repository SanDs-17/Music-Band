"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import bandApi from "../../../lib/bandApi";
import { getBandUser, isBandAuthenticated } from "../../../lib/bandAuth";

function truncate(text, length = 120) {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

export default function BandArtistsPage() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isBandAuthenticated()) setUser(getBandUser());
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");

    const fetchArtists = async () => {
      try {
        const response = await bandApi.get("/artists", {
          params: { search, limit: 24, offset: 0 },
        });
        setArtists(response.data?.items || []);
      } catch (err) {
        setError("Unable to load artists. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, [search]);

  return (
    <div className="band-section">
      <div className="band-section__head">
        <div>
          <h1 className="band-section__title">Find artists and bands</h1>
          <p style={{ color: "rgba(244, 244, 245, 0.65)", marginTop: 6 }}>
            Browse verified musicians, compare rates, and request booking
            proposals directly from the Mukijo Band marketplace.
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
          placeholder="Search by artist name, genre, or keyword"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button className="band-btn band-btn--primary" type="submit">
          Search
        </button>
      </form>

      {loading ? (
        <div className="band-loading">Loading artists…</div>
      ) : error ? (
        <div className="band-error">{error}</div>
      ) : (
        <div
          className="band-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          {artists.length === 0 ? (
            <div className="band-empty">
              No artists found. Try a broader search or check back later.
            </div>
          ) : (
            artists.map((artist) => (
              <Link
                key={artist.id}
                href={`/band/artists/${artist.id}`}
                className="band-card"
              >
                <div className="band-card__title">
                  {artist.display_name || "Artist"}
                </div>
                <div className="band-card__meta">
                  {artist.band_type || "Performer"}
                </div>
                <div className="band-card__meta" style={{ marginTop: 10 }}>
                  {artist.genres?.join(" • ")}
                </div>
                <p style={{ color: "rgba(244, 244, 245, 0.6)", marginTop: 12 }}>
                  {truncate(artist.bio, 130)}
                </p>
                <div className="band-card__price">
                  ₹{artist.base_rate?.toFixed(0) ?? 0}/hr
                </div>
                <div className="band-card__meta">
                  Rating: {artist.rating?.toFixed(1) ?? "5.0"}
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {user ? null : (
        <div className="band-section" style={{ marginTop: 24 }}>
          <div className="band-card">
            <div className="band-card__title">Get the full experience</div>
            <p style={{ color: "rgba(244, 244, 245, 0.55)", lineHeight: 1.6 }}>
              Login or register to send booking requests, manage offers, and
              keep your event planning in one place.
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
