"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import bandApi from "../../../lib/bandApi";
import Link from "next/link";

export default function BandVerifyEmailPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tokenValue = params.get("token") || "";
    setToken(tokenValue);
    if (!tokenValue) {
      setStatus("error");
      setMessage("Invalid verification link.");
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const verify = async () => {
      try {
        const response = await bandApi.post("/auth/verify-email", { token });
        setStatus("success");
        setMessage(response.data?.message || "Email verified successfully.");
      } catch (err) {
        setStatus("error");
        const detail = err?.response?.data?.detail;
        setMessage(
          detail || "Verification failed. The link may be expired or invalid.",
        );
      }
    };

    verify();
  }, [token]);

  return (
    <div className="band-auth">
      <div className="band-auth__card">
        <div className="band-auth__logo">Mukijo Band</div>
        <h1 className="band-auth__title">Email verification</h1>
        <p className="band-auth__sub">
          Confirm your email to activate your Band account.
        </p>

        <div className="band-field" style={{ marginBottom: 24 }}>
          <div
            style={{
              color:
                status === "success"
                  ? "#c6ff3d"
                  : status === "error"
                    ? "#ff8b8b"
                    : "rgba(244,244,245,0.75)",
              lineHeight: 1.6,
            }}
          >
            {message || "Checking your verification link…"}
          </div>
        </div>

        <button
          type="button"
          className="band-btn band-btn--primary"
          style={{ width: "100%" }}
          onClick={() => router.push("/band/login")}
        >
          Go to login
        </button>

        <div className="band-auth__footer">
          <Link href="/band/resend-verification">
            Resend verification email
          </Link>
        </div>
      </div>
    </div>
  );
}
