"use client";

import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { fetchHolidayParkDetails } from "../api/holiday-parks.api";
import { HolidayPark } from "../types/holiday-parks.types";
import { HolidayParkForm } from "./HolidayParkForm";

export function EditHolidayParkPage({ parkId }: { parkId: string }) {
  const [park, setPark] = useState<HolidayPark | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadParkData() {
      if (!parkId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await fetchHolidayParkDetails(parkId);
        if (data) {
          setPark(data);
        } else {
          setError("Holiday Park record not found.");
        }
      } catch (err: any) {
        console.error("Failed to load holiday park details:", err);
        setError("Unable to retrieve holiday park configuration.");
      } finally {
        setLoading(false);
      }
    }
    void loadParkData();
  }, [parkId]);

  if (loading) {
    return (
      <DashboardShell active="Holiday Parks" title="Loading Park Settings..." subtitle="Fetching park configuration.">
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500 font-sans">
          <Loader2 className="w-8 h-8 animate-spin text-[#3b338c]" />
          <span className="text-xs font-semibold text-slate-600">Retrieving Holiday Park specifications...</span>
        </div>
      </DashboardShell>
    );
  }

  if (error || !park) {
    return (
      <DashboardShell active="Holiday Parks" title="Error Loading Park" subtitle="Configuration error.">
        <div className="p-8 max-w-lg mx-auto bg-red-50 border border-red-200 rounded-2xl text-center space-y-4 my-12 font-sans">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-red-900">Holiday Park Not Found</h3>
            <p className="text-xs text-red-700 mt-1">{error || "Invalid Holiday Park ID."}</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return <HolidayParkForm mode="edit" initialData={park} parkId={parkId} />;
}
