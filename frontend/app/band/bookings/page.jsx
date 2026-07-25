"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import bandApi from "../../../lib/bandApi";
import { getBandUser, isBandAuthenticated } from "../../../lib/bandAuth";

const STATUS_COLORS = {
  pending: "rgba(245, 158, 11, 0.15)",
  accepted: "rgba(16, 185, 129, 0.15)",
  counter_offered: "rgba(217, 255, 110, 0.15)",
  completed: "rgba(198, 255, 61, 0.12)",
  rejected: "rgba(239, 68, 68, 0.15)",
  cancelled: "rgba(255, 255, 255, 0.06)",
};

function normalizeBookings(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.bookings)) return data.bookings;
  return [];
}

export default function BandBookingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isBandAuthenticated()) {
      router.replace("/band/login");
      return;
    }
    const currentUser = getBandUser();
    setUser(currentUser);

    const load = async () => {
      try {
        let endpoint = null;
        if (currentUser.role === "client") endpoint = "/bookings/client";
        else if (currentUser.role === "artist") endpoint = "/bookings/artist";
        else if (currentUser.role === "venue_owner")
          endpoint = "/bookings/venue";

        if (!endpoint) {
          setError("Your Band role does not have a bookings view.");
          setBookings([]);
          return;
        }

        const response = await bandApi.get(endpoint);
        setBookings(normalizeBookings(response.data));
      } catch (err) {
        setError("Unable to load bookings. Please refresh or try again later.");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  return (
    <div className="band-section">
      <div className="band-section__head">
        <div>
          <h1 className="band-section__title">Your Band Bookings</h1>
          <p style={{ color: "rgba(244, 244, 245, 0.65)", marginTop: 6 }}>
            Manage booking requests, statuses, and upcoming gigs in one place.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="band-loading">Loading bookings…</div>
      ) : error ? (
        <div className="band-error">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="band-empty">
          No bookings found.{" "}
          {user?.role === "client"
            ? "Browse artists and venues to request a booking."
            : "New booking requests will show up here."}
        </div>
      ) : (
        <div
          className="band-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {bookings.map((booking) => (
            <div
              key={booking.id || `${booking.event_name}-${booking.event_date}`}
              className="band-card"
              style={{ cursor: "default" }}
            >
              <div className="band-card__title">
                {booking.event_name || `Booking #${booking.id}`}
              </div>
              <div
                className="band-card__meta"
                style={{ gap: 10, flexWrap: "wrap" }}
              >
                <span>
                  {booking.event_date
                    ? new Date(booking.event_date).toLocaleDateString()
                    : "Date unknown"}
                </span>
                <span>
                  {booking.start_time ?? ""}
                  {booking.end_time ? ` – ${booking.end_time}` : ""}
                </span>
              </div>
              {booking.artist_display_name && (
                <div className="band-card__meta">
                  Artist: {booking.artist_display_name}
                </div>
              )}
              {booking.venue_name && (
                <div className="band-card__meta">
                  Venue: {booking.venue_name}
                </div>
              )}
              {booking.client_name && (
                <div className="band-card__meta">
                  Client: {booking.client_name}
                </div>
              )}
              <div className="band-card__price">
                ₹{booking.proposed_price ?? booking.price ?? 0}
              </div>
              <span
                className="band-chip"
                style={{
                  background:
                    STATUS_COLORS[booking.status] ||
                    "rgba(255, 255, 255, 0.06)",
                  textTransform: "capitalize",
                }}
              >
                {booking.status?.replace(/_/g, " ") || "Unknown"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
