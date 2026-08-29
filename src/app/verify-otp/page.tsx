import { Suspense } from "react";
import VerifyOtpSection from "./_components/VerifyOtpSection";

export const dynamic = "force-dynamic";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading verification...</div>}>
      <VerifyOtpSection />
    </Suspense>
  );
}
