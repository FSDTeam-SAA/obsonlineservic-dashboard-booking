import React from "react";
import { EditHolidayParkPage } from "@/features/holiday-parks/components/EditHolidayParkPage";

export default async function Page({ params }: { params: Promise<{ parkId: string }> }) {
  const { parkId } = await params;
  return <EditHolidayParkPage parkId={parkId} />;
}
