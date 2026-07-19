import * as React from "react";
import { VenueRegisterForm } from "@/components/venue/VenueRegisterForm";
import { Building2 } from "lucide-react";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

export default function VenueRegistrationPage() {
  return (
    <ProtectedRoute allowedRoles={["venue_owner"]}>
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-3xl mx-auto space-y-4 mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-2">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Onboard Your Venue Space</h1>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Complete the onboarding steps below to register your venue space and owner administrative details.
          </p>
        </div>

        <VenueRegisterForm />
      </div>
    </ProtectedRoute>
  );
}
