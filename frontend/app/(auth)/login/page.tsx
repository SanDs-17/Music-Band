"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/utils/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { setAuth } = useAuth();
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // 1. Post to login endpoint
      const response = await api.post("/auth/login", data);
      const { success, data: tokenData, message } = response.data;
      
      if (success && tokenData) {
        const { access_token } = tokenData;
        
        // 2. Fetch current user profiles
        // We set access token in local storage so that interceptor automatically attaches it
        localStorage.setItem("access_token", access_token);
        
        const profileResponse = await api.get("/auth/me");
        const { data: userData } = profileResponse.data;
        
        if (userData) {
          // 3. Update Zustand Store state
          setAuth(userData, access_token);
          toast.success(message || "Successfully logged in!");
          
          // 4. Redirect to role dashboard
          router.replace(`/${userData.roles[0].name}/dashboard`);
        }
      }
    } catch (err) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const errMsg = error.response?.data?.error?.message || "Invalid login credentials.";
      toast.error(errMsg);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white font-heading">Welcome back</h1>
        <p className="text-sm text-text-secondary">
          Enter your credentials to access your dashboard
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
            <p className="text-xs text-error font-medium mt-1">{errors.email.message}</p>
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
            <p className="text-xs text-error font-medium mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full font-bold h-10 mt-2" disabled={isSubmitting}>
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
