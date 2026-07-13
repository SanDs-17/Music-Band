"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordFormData } from "@/utils/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Password reset token is missing from URL.");
      return;
    }

    try {
      const response = await api.post("/auth/reset-password", {
        token,
        new_password: data.password,
      });
      const { success, message } = response.data;
      if (success) {
        toast.success(message || "Password successfully reset! Please log in.");
        router.push("/login");
      }
    } catch (err) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const errMsg = error.response?.data?.error?.message || "Failed to reset password.";
      toast.error(errMsg);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col space-y-4 text-center">
        <h1 className="text-xl font-bold text-error">Invalid Reset Link</h1>
        <p className="text-sm text-text-secondary">
          This password reset request has expired, or the link is invalid. Please initiate a new password reset.
        </p>
        <Link href="/forgot-password">
          <Button className="w-full">Forgot Password</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white font-heading">New password</h1>
        <p className="text-sm text-text-secondary">
          Enter your new password below to reset your login credentials
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            disabled={isSubmitting}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-error font-medium mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            disabled={isSubmitting}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-error font-medium mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full font-bold h-10 mt-2" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
