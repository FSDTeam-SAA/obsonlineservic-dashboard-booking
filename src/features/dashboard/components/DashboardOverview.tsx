"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ChartNoAxesCombined,
  CirclePercent,
  Hotel,
  MapPin,
  ShieldCheck,
  UsersRound,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Clock,
  Wallet,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { fetchDashboardOverview } from "../api/dashboard.api";
import { DashboardOverviewData } from "../types/dashboard.types";
import { DashboardOverviewSkeleton } from "./DashboardOverviewSkeleton";

const iconMap: Record<string, any> = {
  parks: Hotel,
  properties: MapPin,
  offers: CirclePercent,
  bookings: ChartNoAxesCombined,
};

export function DashboardOverview() {
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboardOverview();
      setData(res);
    } catch (err: any) {
      console.error("Failed to load dashboard overview data:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load dashboard statistics. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  if (loading) {
    return <DashboardOverviewSkeleton />;
  }

  if (error || !data) {
    return (
      <DashboardShell
        active="Dashboard"
        title={
          <>
            Welcome back <span aria-hidden="true">👋</span>
          </>
        }
        subtitle="Manage your luxury holiday destinations from one beautiful workspace."
      >
        <main className="p-8">
          <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50/50 p-12 text-center">
            <AlertCircle className="size-12 text-red-500 mb-3" />
            <h2 className="text-xl font-semibold text-slate-800">
              Dashboard Data Unavailable
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-md">{error}</p>
            <button
              onClick={loadOverview}
              className="mt-6 flex items-center gap-2 rounded-md bg-[#3b338c] px-4 py-2 text-sm font-medium text-white shadow hover:bg-[#2f2873] transition-colors"
            >
              <RefreshCw className="size-4" /> Try Again
            </button>
          </div>
        </main>
      </DashboardShell>
    );
  }

  const { stats, bookingsSummary, performanceOverview, activeOffers } = data;

  return (
    <DashboardShell
      active="Dashboard"
      title={
        <>
          Welcome back <span aria-hidden="true">👋</span>
        </>
      }
      subtitle="Manage your luxury holiday destinations from one beautiful workspace."
    >
      <main className="grid gap-6 p-5 md:p-8">
        {/* KPI Stats Section */}
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {stats?.map((stat) => {
            const IconComponent = iconMap[stat.key] || ChartNoAxesCombined;
            return (
              <article
                key={stat.title}
                className="relative overflow-hidden rounded border border-slate-200 bg-white p-7 shadow-sm transition-all hover:shadow-md"
              >
                <span className="absolute -right-8 -top-8 size-28 rounded-full bg-gradient-to-br from-[#3b338c]/20 to-violet-200/20" />
                <span className="grid size-12 place-items-center rounded-full bg-slate-100 text-[#3b338c]">
                  <IconComponent size={20} />
                </span>
                <h2 className="mt-3 text-xl font-normal uppercase text-slate-600">
                  {stat.title}
                </h2>
                <strong className="mt-3 block font-serif text-4xl text-slate-900">
                  {stat.value}
                </strong>
                <p className="mt-2 text-sm text-slate-600">{stat.note}</p>
              </article>
            );
          })}
        </section>

        {/* Bookings Summary Banner */}
        {bookingsSummary && (
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="size-5 text-[#3b338c]" />
              Bookings & Revenue Metrics
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                <span className="text-xs font-medium uppercase text-slate-500 flex items-center gap-1.5">
                  <ChartNoAxesCombined className="size-3.5 text-[#3b338c]" />
                  Total Bookings
                </span>
                <strong className="block mt-2 text-2xl font-bold text-slate-900">
                  {bookingsSummary.totalBookings}
                </strong>
                <span className="text-xs font-semibold text-emerald-600 mt-1 block">
                  {bookingsSummary.totalBookingsGrowth}
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                <span className="text-xs font-medium uppercase text-slate-500 flex items-center gap-1.5">
                  <Clock className="size-3.5 text-amber-600" />
                  Pending Bookings
                </span>
                <strong className="block mt-2 text-2xl font-bold text-amber-600">
                  {bookingsSummary.pendingBookings}
                </strong>
                <span className="text-xs text-slate-600 mt-1 block">
                  {bookingsSummary.pendingNote}
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                <span className="text-xs font-medium uppercase text-slate-500 flex items-center gap-1.5">
                  <Wallet className="size-3.5 text-emerald-600" />
                  Total Revenue
                </span>
                <strong className="block mt-2 text-2xl font-bold text-emerald-700">
                  {bookingsSummary.totalRevenue}
                </strong>
                <span className="text-xs font-semibold text-emerald-600 mt-1 block">
                  {bookingsSummary.revenueGrowth}
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                <span className="text-xs font-medium uppercase text-slate-500 flex items-center gap-1.5">
                  <Users className="size-3.5 text-[#3b338c]" />
                  Active Guests
                </span>
                <strong className="block mt-2 text-2xl font-bold text-slate-900">
                  {bookingsSummary.activeGuests}
                </strong>
                <span className="text-xs text-slate-600 mt-1 block">
                  {bookingsSummary.activeGuestsNote}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Performance Overview & Active Offers Section */}
        <section className="grid gap-6 xl:grid-cols-2">
          {/* Performance Bar Chart Overview */}
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-medium text-slate-900">
              Performance overview
            </h2>
            <div className="mt-8 flex h-52 items-end gap-2 border-b border-slate-200 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_51px,#eef2f6_52px)] p-2">
              {(
                performanceOverview?.monthlyChartData || [
                  42, 58, 47, 72, 63, 88, 76, 94, 68, 82, 59, 74,
                ]
              ).map((h, i) => (
                <i
                  key={i}
                  style={{ height: `${h}%` }}
                  title={`Month ${i + 1}: ${h}% capacity`}
                  className={`flex-1 rounded-t transition-all hover:opacity-80 ${
                    i % 6 === 0 ? "bg-[#3b338c]" : "bg-violet-300"
                  }`}
                />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between rounded bg-slate-100 p-4 text-sm">
              <span className="flex items-center gap-2 text-slate-600">
                <ShieldCheck size={18} /> Booking revenue
              </span>
              <div className="flex items-center gap-3">
                <strong className="text-slate-900">
                  {performanceOverview?.bookingRevenue || "£84,590"}
                </strong>
                <em className="not-italic font-semibold text-emerald-700">
                  {performanceOverview?.growthPercentage || "+12.4%"}
                </em>
              </div>
            </div>
          </article>

          {/* Active Seasonal Offers Card */}
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-medium text-slate-900">
              Active offers
            </h2>
            <div className="mt-5 grid gap-4">
              {activeOffers && activeOffers.length > 0 ? (
                activeOffers.map((offer) => (
                  <div
                    key={offer.id || offer.title}
                    className="rounded border border-slate-200 p-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="grid size-11 place-items-center rounded-full bg-slate-100 text-[#3b338c]">
                        <UsersRound size={18} />
                      </span>
                      <span className="rounded-full bg-[#3b338c]/10 px-3 py-1 text-xs font-medium text-[#3b338c]">
                        {offer.status || "Live"}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-slate-900">
                      {offer.title}
                    </h3>
                    <strong className="block pt-2 text-[#3b338c]">
                      {offer.discount}
                    </strong>
                    <p className="pt-2 text-sm text-slate-600">{offer.date}</p>
                  </div>
                ))
              ) : (
                <div className="rounded border border-slate-200 p-6 text-center text-slate-500">
                  No active promotional offers currently running.
                </div>
              )}
            </div>
          </article>
        </section>
      </main>
    </DashboardShell>
  );
}
