"use client";

import React, { use } from "react";
import { EditPropertyForm } from "@/features/properties/components/EditPropertyForm";

export const dynamic = "force-dynamic";

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return <EditPropertyForm propertyId={resolvedParams.id} />;
}
