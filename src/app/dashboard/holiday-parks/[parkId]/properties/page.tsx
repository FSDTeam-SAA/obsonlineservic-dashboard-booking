import React from "react";
import { ParkPropertiesPage } from "@/features/properties/components/ParkPropertiesPage";

export default async function Page({ params }: { params: Promise<{ parkId: string }> }) {
  const { parkId } = await params;
  return <ParkPropertiesPage parkId={parkId} />;
}
