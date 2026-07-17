"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/utils/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { getRoleDashboard } from "@/utils/role-routes";
import * as React from "react";
import { Loader2 } from "lucide-react";

function LoginContent() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const roleParam = searchParams.get("role");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const getSubtitle = () => {
    switch (roleParam) {
      case "client":
        return "Enter your credentials to access your client account";
      case "artist":
        return "Enter your credentials to access your artist portal";
      case "venue_owner":
        return "Enter your credentials to access your venue dashboard";
      case "admin":
        return "Enter your credentials to access your admin workspace";
      default:
        return "Enter your credentials to access your dashboard";
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      // 1. Exchange credentials for tokens
      const loginResponse = await api.post("/auth/login", data);
      const { success, data: tokenData, message } = loginResponse.data;

      if (!success || !tokenData) {
        toast.error("Login failed. Please try again.");
        return;
      }

      const { access_token } = tokenData;

      // 2. Store the access token in localStorage BEFORE calling /auth/me
      //    so the Axios request interceptor auto-attaches the Bearer header.
      localStorage.setItem("access_token", access_token);

      // 3. Fetch the authenticated user profile (includes roles array)
      const meResponse = await api.get("/auth/me");
      const { data: userData } = meResponse.data;

      if (!userData) {
        toast.error("Failed to load user profile. Please try again.");
        return;
      }

      // 4. Persist to Zustand store.
      //    setAuth also mirrors the token to a cookie so Next.js middleware
      //    allows access to protected dashboard routes.
      //    normaliseUserRole() inside setAuth derives user.role from roles[0].name.
      setAuth(userData, access_token);

      toast.success(message || "Successfully logged in!");

      // 5. Navigate to the correct role dashboard using the centralized resolver.
      //    Use the first role from the backend response (canonical source).
      const primaryRole =
        userData.roles?.[0]?.name ?? userData.role ?? "client";
      let destination = getRoleDashboard(primaryRole);

      const pendingBookingIntent = sessionStorage.getItem("pending_booking_intent");
      if (pendingBookingIntent && primaryRole === "client") {
        sessionStorage.setItem("active_booking_intent", pendingBookingIntent);
        sessionStorage.removeItem("pending_booking_intent");
        destination = "/client/bookings";
      }

      // router.replace so the login page is not in browser history
      router.replace(destination);
    } catch (err) {
      const error = err as {
        response?: { data?: { error?: { message?: string } } };
      };
      const errMsg =
        error.response?.data?.error?.message ?? "Invalid login credentials.";
      toast.error(errMsg);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary font-heading">
          Welcome back
        </h1>
        <p className="text-sm text-text-secondary">
          {getSubtitle()}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={isSubmitting}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-error font-medium mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline font-semibold"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            disabled={isSubmitting}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-error font-medium mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full font-bold h-10 mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Log In"}
        </Button>
      </form>

      <div className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline font-semibold">
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <div className="flex flex-col items-center justify-center text-center space-y-6 py-6">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    }>
      <LoginContent />
    </React.Suspense>
  );
}

