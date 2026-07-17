"use client";

import * as React from "react";
import { artistService } from "@/services/artistService";
import { AvailabilityData } from "@/types/artist";
import { AvailabilityCalendar } from "@/components/artist/calendar/AvailabilityCalendar";
import { AvailabilityWeekly } from "@/components/artist/calendar/AvailabilityWeekly";
import { ConflictChecker } from "@/components/artist/calendar/ConflictChecker";
import { ArtistBookingInbox } from "@/components/artist/ArtistBookingInbox";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, CalendarDays, Inbox, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function ArtistBookingsCalendarPage() {
  const [availability, setAvailability] = React.useState<AvailabilityData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAvailability = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await artistService.getAvailability();
      setAvailability(data);
    } catch (err) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = error.response?.data?.error?.message || "Failed to load availability config.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleUpdateAvailability = async (updated: AvailabilityData) => {
    try {
      const data = await artistService.updateAvailability(updated);
      setAvailability(data);
      toast.success("Calendar availability updated!");
    } catch {
      toast.error("Failed to update availability calendar schedule.");
      throw new Error(); // let the children component handle saving state reset
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-sm text-text-secondary animate-pulse">
          Loading booking and calendar controls...
        </p>
      </div>
    );
  }

  if (error || !availability) {
    return (
      <div className="flex items-center justify-center min-h-[65vh] p-4">
        <ErrorState 
          title="Availability Calendar Load Failure"
          message={error || "An unexpected error occurred while loading your availability calendar details."} 
          onRetry={fetchAvailability}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Bookings & Calendar Control
          </h1>
          <p className="text-xs text-text-secondary">
            Respond to client inquiries, configure weekly slots, breaks, holidays, and verify event slots.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchAvailability}
          className="flex items-center gap-1.5 self-start sm:self-center text-xs h-9"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reload Controls</span>
        </Button>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="bg-bg-elevated border border-border/80 p-1 rounded-xl flex gap-1 self-start max-w-sm mb-4">
          <TabsTrigger value="inbox" className="flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg w-1/2 justify-center">
            <Inbox className="h-3.5 w-3.5" />
            <span>Booking Inbox</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg w-1/2 justify-center">
            <Clock className="h-3.5 w-3.5" />
            <span>Slots & Schedule</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <ArtistBookingInbox />
        </TabsContent>

        <TabsContent value="schedule">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Monthly Grid */}
            <div className="lg:col-span-2 space-y-6">
              <AvailabilityCalendar 
                availability={availability} 
                onSave={handleUpdateAvailability} 
              />
            </div>

            {/* Right Column: Weekly Schedule & Conflict Check */}
            <div className="space-y-6">
              <ConflictChecker />
              <AvailabilityWeekly 
                availability={availability} 
                onSave={handleUpdateAvailability} 
              />
            </div>

          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}
