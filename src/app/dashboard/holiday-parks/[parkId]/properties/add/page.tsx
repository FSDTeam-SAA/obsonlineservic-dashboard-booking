import React from "react";
import { AddPropertyForm } from "@/features/properties/components/AddPropertyForm";

export default async function Page({ params }: { params: Promise<{ parkId: string }> }) {
  const { parkId } = await params;
  return <AddPropertyForm parkId={parkId} />;
}
