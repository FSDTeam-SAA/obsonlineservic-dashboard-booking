import React, { Suspense } from 'react';
import LoginSection from './_components/LoginSection';

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading login...</div>}>
      <LoginSection />
    </Suspense>
  );
}
