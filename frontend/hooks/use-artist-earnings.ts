"use client";

import * as React from "react";
import { earningsService } from "@/services/earningsService";
import { EarningsSummary } from "@/types/earnings";

export function useArtistEarnings() {
  const [data, setData] = React.useState<EarningsSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchEarnings = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await earningsService.getEarningsSummary();
      setData(summary);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to load earnings metrics.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  return {
    data,
    loading,
    error,
    refetch: fetchEarnings
  };
}
