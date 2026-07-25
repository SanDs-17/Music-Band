"use client";

import { useState } from "react";
import Link from "next/link";
import bandApi from "../../../lib/bandApi";

export default function BandForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await bandApi.post("/auth/forgot-password", { email });
      setMessage(
        response.data?.message ||
          "If that email exists, a reset link has been sent.",
      );
    } catch {
      setError("Unable to submit request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="band-auth">
      <div className="band-auth__card">
        <div className="band-auth__logo">Mukijo Band</div>
        <h1 className="band-auth__title">Forgot password</h1>
        <p className="band-auth__sub">
          Enter your registered email to receive a password reset link.
        </p>

        {error && <div className="band-error">{error}</div>}
        {message && (
          <div
            className="band-card__meta"
            style={{ color: "#c6ff3d", marginBottom: 16 }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="band-field">
            <label className="band-field__label">Email address</label>
            <input
              type="email"
              className="band-field__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="band-btn band-btn--primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Sending reset link…" : "Send reset link"}
          </button>
        </form>

        <div className="band-auth__footer">
          Remembered your password? <Link href="/band/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
