"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { verifyCode } from "@/features/auth/api/verify-code.api";

export default function VerifyOtpSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => setEmail(sessionStorage.getItem("password-reset-email") ?? ""), []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await verifyCode(email, otp);
      sessionStorage.setItem("password-reset-email", email);
      router.push("/reset-password");
    } catch {
      setError("This reset link has expired. Request a new one.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <main className="flex min-h-dvh items-center justify-center bg-slate-950 p-4 sm:p-6"><section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8" aria-labelledby="verify-code-title"><ShieldCheck className="mb-5 h-8 w-8 text-indigo-300" aria-hidden="true" /><h1 id="verify-code-title" className="text-2xl font-bold text-white">Check your email</h1><p className="mt-2 text-sm leading-6 text-slate-400">Enter the six-digit verification code we sent to your email address.</p>{searchParams.get("sent") ? <p role="status" className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">Verification code sent. Check your inbox.</p> : null}<form onSubmit={handleSubmit} className="mt-7 space-y-5"><div><label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">Email address</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-base text-white outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" /></div><div><label htmlFor="otp" className="mb-2 block text-sm font-medium text-slate-200">Verification code</label><input id="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-base tracking-[0.35em] text-white outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" /></div>{error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}<button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? "Verifying..." : "Verify code"}</button></form><a href="/forgot-password" className="mt-6 inline-block rounded text-sm text-indigo-300 hover:text-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">Request a new code</a></section></main>;
}
