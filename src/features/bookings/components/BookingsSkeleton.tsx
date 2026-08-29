import React from "react";

export function BookingsSkeleton() {
  return (
    <div className="grid gap-6 p-5 md:p-8 animate-pulse font-sans">
      {/* Stats Skeleton Row */}
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] space-y-3"
          >
            <div className="size-12 rounded-full bg-slate-200" />
            <div className="h-3 w-24 bg-slate-100 rounded-md" />
            <div className="h-8 w-20 bg-slate-200 rounded-md" />
            <div className="h-3 w-32 bg-slate-100 rounded-md" />
          </div>
        ))}
      </section>

      {/* Filter Controls Skeleton */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col gap-4 sm:flex-row items-center justify-between">
        <div className="h-11 flex-1 bg-slate-100 rounded-lg" />
        <div className="h-11 w-44 bg-slate-100 rounded-lg" />
        <div className="h-11 w-56 bg-slate-100 rounded-lg" />
      </section>

      {/* Table Skeleton */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-6 space-y-4">
        <div className="h-6 w-full bg-slate-100 rounded-md" />
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="h-12 w-full bg-slate-50 rounded-md flex items-center justify-between px-4">
            <div className="h-4 w-20 bg-slate-200 rounded-md" />
            <div className="h-4 w-36 bg-slate-200 rounded-md" />
            <div className="h-4 w-32 bg-slate-200 rounded-md" />
            <div className="h-4 w-28 bg-slate-200 rounded-md" />
            <div className="h-4 w-16 bg-slate-200 rounded-md" />
            <div className="h-6 w-20 bg-slate-200 rounded-full" />
          </div>
        ))}
      </section>
    </div>
  );
}
