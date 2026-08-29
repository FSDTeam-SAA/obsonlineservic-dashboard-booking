import React from "react";

export function SubscribersSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
      {/* Search and Filters Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="h-10 bg-slate-200 rounded w-full sm:max-w-xs" />
        <div className="h-10 bg-slate-200 rounded w-24" />
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              {["Email", "Status", "Subscribed At"].map((col) => (
                <th key={col} className="pb-4 text-left">
                  <div className="h-4 bg-slate-200 rounded w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-4">
                  <div className="h-4 bg-slate-200 rounded w-48" />
                </td>
                <td className="py-4">
                  <div className="h-5 bg-slate-200 rounded w-16" />
                </td>
                <td className="py-4">
                  <div className="h-4 bg-slate-200 rounded w-24" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-between items-center pt-4">
        <div className="h-4 bg-slate-200 rounded w-24" />
        <div className="flex gap-2">
          <div className="h-8 bg-slate-200 rounded w-16" />
          <div className="h-8 bg-slate-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
