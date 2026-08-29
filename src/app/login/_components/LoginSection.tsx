"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Eye, EyeOff, Lock, ShieldAlert, X } from "lucide-react";

function getErrorMessage(error: string) {
  if (error === "AccessDenied") return "Only administrators can access this dashboard.";
  if (error === "SessionExpired") return "Your session has expired. Please log in again.";
  if (error === "CredentialsSignin") return "Invalid credentials. Please try again.";
  return "Something went wrong. Please try again later.";
}

export default function LoginSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) setError(getErrorMessage(errorParam));
    if (searchParams.get("reset") === "success") {
      setSuccess("Your password has been reset. You can now log in.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "authenticated" && session.user?.role === "ADMIN") {
      router.replace(callbackUrl);
    }
  }, [callbackUrl, router, session?.user?.role, status]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError(getErrorMessage(result.error));
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 font-sans sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,51,140,0.15),transparent_60%)]" />
      <section className="relative z-10 w-full max-w-[460px] rounded-3xl border border-slate-800/80 bg-slate-900/70 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-10" aria-labelledby="login-title">
        <header className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-600/10"><Lock className="h-6 w-6 text-indigo-400" aria-hidden="true" /></div>
          <h1 id="login-title" className="mb-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Admin Portal</h1>
          <p className="text-sm text-slate-400">Enter your administration credentials</p>
        </header>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Email address</label><input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@service.com" className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3.5 text-base text-white outline-none transition-colors placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" /></div>
          <div><div className="mb-2 flex items-center justify-between gap-4"><label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label><a href="/forgot-password" className="rounded text-xs font-medium text-indigo-300 hover:text-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">Forgot Password?</a></div><div className="relative"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3.5 pr-12 text-base text-white outline-none transition-colors placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">{showPassword ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}</button></div></div>
          <button type="submit" disabled={isSubmitting} className="flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(79,70,229,0.25)] transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:bg-indigo-800 disabled:opacity-50">{isSubmitting ? "Authenticating..." : "Sign In to Console"}</button>
        </form>
      </section>
      {error ? <div role="alert" className="fixed bottom-4 right-4 z-20 flex max-w-sm items-start gap-3 rounded-xl border border-red-500/30 bg-slate-900 px-4 py-3 text-sm text-red-200 shadow-xl"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden="true" /><span>{error}</span><button type="button" aria-label="Dismiss error" onClick={() => setError(null)} className="-mr-1 -mt-1 rounded p-1 text-red-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"><X className="h-4 w-4" aria-hidden="true" /></button></div> : null}
      {success ? <div role="status" className="fixed bottom-4 right-4 z-20 flex max-w-sm items-start gap-3 rounded-xl border border-emerald-500/30 bg-slate-900 px-4 py-3 text-sm text-emerald-200 shadow-xl"><span>{success}</span><button type="button" aria-label="Dismiss confirmation" onClick={() => setSuccess(null)} className="-mr-1 -mt-1 rounded p-1 text-emerald-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"><X className="h-4 w-4" aria-hidden="true" /></button></div> : null}
    </main>
  );
}
