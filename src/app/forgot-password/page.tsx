import { Suspense } from "react";
import ForgotPasswordSection from "./_components/ForgotPasswordSection";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ForgotPasswordSection />
    </Suspense>
  );
}
