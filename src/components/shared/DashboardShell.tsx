"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Bell, CalendarDays, CirclePercent, Grid2X2, LogOut, Search, Settings, TicketCheck, UsersRound, User, Loader2, Mail, TreePine, MessageSquare } from "lucide-react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

const navigation = [
  ["Dashboard", "/dashboard", Grid2X2],
  ["Properties", "/dashboard/properties", CalendarDays],
  ["Holiday Parks", "/dashboard/holiday-parks", TreePine],
  ["Bookings", "/dashboard/bookings", TicketCheck],
  ["Offers", "/dashboard/offers", CirclePercent],
  ["Reviews", "/dashboard/reviews", MessageSquare],
  ["Users", "/dashboard/users", UsersRound],
  ["Newsletter", "/dashboard/newsletter", Mail],
  ["Settings", "/dashboard/settings", Settings],
] as const;

const logo = "https://www.figma.com/api/mcp/asset/2796a9c2-7193-433a-8347-3a44caff6711.png";

export function DashboardShell({
  active,
  title,
  subtitle,
  children,
}: Readonly<{
  active: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
}>) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const name = session?.user?.name || "Admin Account";
  const email = session?.user?.email || "admin@example.com";
  const role = session?.user?.role || "Administrator";
  const avatarUrl = session?.user?.image || "";

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#3b338c]" />
      </div>
    );
  }

  // Redirect if not admin
  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    if (typeof window !== "undefined") {
      router.replace("/login");
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[260px] flex-col justify-between bg-white px-6 pb-6 pt-3 md:flex border-r border-slate-200">
        <div>
          <div className="flex h-[106px] items-center border-b border-slate-200">
            <img src={logo} alt="OBS Online Service" className="max-h-20 w-full object-contain object-left" />
          </div>
          <nav className="mt-12 grid gap-6">
            {navigation.map(([name, href, Icon]) => (
              <Link
                key={name}
                href={href}
                className={`flex h-12 items-center gap-2 rounded px-3 text-base transition-colors ${
                  active === name ? "bg-[#3b338c] font-bold text-white shadow-sm" : "text-slate-900 hover:bg-violet-50"
                }`}
              >
                <Icon size={21} aria-hidden="true" />
                {name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="grid gap-6">
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <div className="size-11 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="size-full object-cover" />
              ) : (
                <User className="size-5 text-slate-500" />
              )}
            </div>
            <div className="min-w-0">
              <strong className="block text-sm font-semibold truncate leading-none text-slate-800">{name}</strong>
              <span className="block pt-1 text-[11px] text-slate-400 truncate capitalize">{role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#e53838] text-sm font-semibold text-[#e53838] hover:bg-red-50/50 transition-colors cursor-pointer"
          >
            <LogOut size={18} aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="md:ml-[260px]">
        {/* Header */}
        <header className="sticky top-0 z-10 flex min-h-[118px] flex-col justify-between gap-4 border-b border-slate-200 bg-white/90 px-5 py-5 backdrop-blur md:flex-row md:items-center md:px-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#1a1a1a]">{title}</h1>
            <p className="mt-2 text-sm text-slate-500 md:text-base">{subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-slate-400 md:w-[320px] focus-within:bg-white focus-within:border-[#3b338c] transition-all">
              <Search size={17} />
              <span className="sr-only">Search</span>
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-700" placeholder="Search parks, bookings..." />
            </label>
            <button aria-label="Notifications" className="relative grid size-11 place-items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
              <Bell size={18} className="text-slate-600" />
              <i className="absolute right-3.5 top-3.5 size-2 rounded-full bg-red-650" />
            </button>
            
            <div className="hidden items-center gap-3 sm:flex pl-2 border-l border-slate-200">
              <div className="size-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="size-full object-cover" />
                ) : (
                  <User className="size-4.5 text-slate-500" />
                )}
              </div>
              <div>
                <strong className="block text-sm font-semibold truncate text-slate-800 leading-none">{name}</strong>
                <span className="mt-1.5 inline-flex rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 border border-green-200 uppercase">
                  {role}
                </span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Workspace Content */}
        {children}
      </div>
    </div>
  );
}
