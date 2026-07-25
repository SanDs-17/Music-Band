"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import bandApi from "../../../lib/bandApi";

export default function BandResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tokenValue = params.get("token") || "";
    setToken(tokenValue);
    if (!tokenValue) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Missing reset token.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await bandApi.post("/auth/reset-password", {
        token,
        new_password: password,
      });
      setMessage(response.data?.message || "Your password has been updated.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(detail || "Unable to reset your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="band-auth">
      <div className="band-auth__card">
        <div className="band-auth__logo">Mukijo Band</div>
        <h1 className="band-auth__title">Reset password</h1>
        <p className="band-auth__sub">
          Create a new password for your Band account.
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
            <label className="band-field__label">New password</label>
            <input
              type="password"
              className="band-field__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="band-field">
            <label className="band-field__label">Confirm new password</label>
            <input
              type="password"
              className="band-field__input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="band-btn band-btn--primary"
            style={{ width: "100%" }}
            disabled={loading || !!error}
          >
            {loading ? "Resetting password…" : "Reset password"}
          </button>
        </form>

        <div className="band-auth__footer">
          <Link href="/band/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
