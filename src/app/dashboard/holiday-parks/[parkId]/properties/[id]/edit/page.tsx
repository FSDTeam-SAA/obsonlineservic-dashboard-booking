import React from "react";
import { EditPropertyForm } from "@/features/properties/components/EditPropertyForm";

export default async function Page({ params }: { params: Promise<{ parkId: string; id: string }> }) {
  const { parkId, id } = await params;
  return <EditPropertyForm propertyId={id} parkId={parkId} />;
}
