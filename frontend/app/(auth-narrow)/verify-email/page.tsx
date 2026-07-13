"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      <div className="p-4 bg-primary/10 rounded-full border border-primary/20 text-primary">
        <Mail className="h-12 w-12" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-white font-heading">Verify your email</h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-sm">
          We have sent a verification code to your email address. Please click the confirmation link inside the email to verify your profile account.
        </p>
      </div>
      <div className="w-full pt-4 space-y-2">
        <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
          Check Verification Status
        </Button>
        <Link href="/" className="block">
          <Button variant="ghost" className="w-full">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
