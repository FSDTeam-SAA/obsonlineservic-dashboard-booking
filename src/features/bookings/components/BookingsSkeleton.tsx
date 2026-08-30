import React from "react";

export function BookingsSkeleton() {
  return (
    <div className="grid gap-6 p-5 md:p-8 animate-pulse font-sans max-w-7xl mx-auto w-full">
      {/* Stats Skeleton Row */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-slate-200/80 rounded-md" />
              <div className="size-11 rounded-xl bg-slate-100" />
            </div>
            <div className="h-9 w-24 bg-slate-200/80 rounded-lg" />
            <div className="h-3 w-36 bg-slate-100 rounded-md" />
          </div>
        ))}
      </section>

      {/* Filter Controls Skeleton */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5 lg:flex-row items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
          <div className="h-11 flex-1 bg-slate-100 rounded-xl" />
          <div className="h-11 w-full sm:w-44 bg-slate-100 rounded-xl" />
          <div className="h-11 w-full sm:w-44 bg-slate-100 rounded-xl" />
          <div className="h-11 w-full sm:w-52 bg-slate-100 rounded-xl" />
        </div>
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          <div className="h-11 w-32 bg-slate-100 rounded-xl" />
          <div className="h-11 w-32 bg-slate-100 rounded-xl" />
        </div>
      </section>

      {/* Table Skeleton */}
      <section className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="h-5 w-40 bg-slate-200/70 rounded-md" />
          <div className="h-4 w-24 bg-slate-200/70 rounded-md" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div key={row} className="h-14 w-full bg-slate-50/80 rounded-xl flex items-center justify-between px-4 gap-4">
              <div className="h-5 w-24 bg-slate-200/80 rounded-md" />
              <div className="flex items-center gap-3 flex-1 max-w-xs">
                <div className="size-9 rounded-full bg-slate-200/80 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 bg-slate-200/80 rounded-md" />
                  <div className="h-3 w-36 bg-slate-100 rounded-md" />
                </div>
              </div>
              <div className="h-4 w-32 bg-slate-200/80 rounded-md hidden md:block" />
              <div className="h-4 w-28 bg-slate-200/80 rounded-md hidden lg:block" />
              <div className="h-6 w-20 bg-slate-200/80 rounded-full" />
              <div className="h-8 w-24 bg-slate-200/80 rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
