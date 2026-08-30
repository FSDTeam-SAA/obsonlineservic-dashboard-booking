import React from "react";

export function HolidayParkTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[750px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
            <th className="py-3 px-4">Holiday Park</th>
            <th className="py-3 px-4">Location</th>
            <th className="py-3 px-4">Properties</th>
            <th className="py-3 px-4">Total Capacity</th>
            <th className="py-3 px-4">Starting Rate</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index} className="border-b border-slate-200 text-center animate-pulse">
              <td className="p-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="size-[60px] rounded-xl bg-slate-200 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded-md w-32" />
                    <div className="h-3 bg-slate-200 rounded-md w-20" />
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="h-4 bg-slate-200 rounded-md w-24 mx-auto" />
              </td>
              <td className="p-4">
                <div className="h-4 bg-slate-200 rounded-md w-12 mx-auto" />
              </td>
              <td className="p-4">
                <div className="h-4 bg-slate-200 rounded-md w-20 mx-auto" />
              </td>
              <td className="p-4">
                <div className="h-4 bg-slate-200 rounded-md w-24 mx-auto" />
              </td>
              <td className="p-4">
                <div className="h-6 bg-slate-200 rounded-full w-16 mx-auto" />
              </td>
              <td className="p-4">
                <div className="size-6 bg-slate-200 rounded-md mx-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
