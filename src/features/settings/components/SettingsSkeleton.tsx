import React from "react";

export function SettingsSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div>
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-2" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card Skeleton */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-slate-200" />
          <div className="h-5 bg-slate-200 rounded w-1/2" />
          <div className="h-4 bg-slate-200 rounded w-2/3" />
          <div className="h-9 bg-slate-200 rounded w-full" />
        </div>

        {/* Form Fields Skeleton */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-10 bg-slate-200 rounded w-full" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-10 bg-slate-200 rounded w-full" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-10 bg-slate-200 rounded w-full" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-10 bg-slate-200 rounded w-full" />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <div className="h-10 bg-slate-200 rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
