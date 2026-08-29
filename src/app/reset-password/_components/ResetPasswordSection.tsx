"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, KeyRound } from "lucide-react";
import { resetPassword } from "@/features/auth/api/reset-password.api";
import { hasStrongPassword, passwordRequirements } from "@/features/auth/password-strength";

export default function ResetPasswordSection() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const resetEmail = sessionStorage.getItem("password-reset-email");
    if (!resetEmail) {
      router.replace("/forgot-password");
      return;
    }
    setEmail(resetEmail);
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    if (!hasStrongPassword(newPassword)) {
      setError("Use a password that meets every requirement below.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await resetPassword(email, newPassword);
      sessionStorage.removeItem("password-reset-email");
      router.replace("/login?reset=success");
    } catch {
      setError("This reset link has expired. Request a new one.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <main className="flex min-h-dvh items-center justify-center bg-slate-950 p-4 sm:p-6"><section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8" aria-labelledby="reset-password-title"><KeyRound className="mb-5 h-8 w-8 text-indigo-300" aria-hidden="true" /><h1 id="reset-password-title" className="text-2xl font-bold text-white">Choose a new password</h1><p className="mt-2 text-sm leading-6 text-slate-400">Use a unique password you do not use elsewhere.</p><form onSubmit={handleSubmit} className="mt-7 space-y-5"><div><label htmlFor="new-password" className="mb-2 block text-sm font-medium text-slate-200">New password</label><input id="new-password" type="password" autoComplete="new-password" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-base text-white outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" /></div><ul className="space-y-1.5 text-xs text-slate-400" aria-label="Password requirements">{passwordRequirements.map((requirement) => { const isMet = requirement.test(newPassword); return <li key={requirement.label} className={isMet ? "flex items-center gap-2 text-emerald-300" : "flex items-center gap-2"}><Check className="h-3.5 w-3.5" aria-hidden="true" />{requirement.label}</li>; })}</ul><div><label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-slate-200">Confirm password</label><input id="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-base text-white outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" /></div>{error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}<button type="submit" disabled={isSubmitting || !email} className="h-12 w-full rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? "Resetting password..." : "Reset password"}</button></form></section></main>;
}
