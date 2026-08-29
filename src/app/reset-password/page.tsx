import { Suspense } from "react";
import ResetPasswordSection from "./_components/ResetPasswordSection";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ResetPasswordSection />
    </Suspense>
  );
}
