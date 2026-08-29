"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Mail } from "lucide-react";
import { forgotPassword } from "@/features/auth/api/forgot-password.api";

export default function ForgotPasswordSection() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      sessionStorage.setItem("password-reset-email", email);
      router.push("/verify-otp?sent=1");
    } catch {
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <main className="flex min-h-dvh items-center justify-center bg-slate-950 p-4 sm:p-6"><section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8" aria-labelledby="forgot-password-title"><KeyRound className="mb-5 h-8 w-8 text-indigo-300" aria-hidden="true" /><h1 id="forgot-password-title" className="text-2xl font-bold text-white">Reset your password</h1><p className="mt-2 text-sm leading-6 text-slate-400">Enter the email address for your administrator account. We’ll send a verification code.</p><form onSubmit={handleSubmit} className="mt-7 space-y-5"><div><label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">Email address</label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" /><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 py-3 pl-10 pr-3 text-base text-white outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" /></div></div>{error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}<button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? "Sending code..." : "Send verification code"}</button></form><a href="/login" className="mt-6 inline-block rounded text-sm text-indigo-300 hover:text-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">Back to login</a></section></main>;
}
