import React from "react";

export function HolidayParkTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index} className="border-b border-slate-200 text-center animate-pulse">
          <td className="p-4 text-left">
            <div className="flex items-center gap-3">
              <div className="size-[60px] rounded bg-slate-200 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-32" />
                <div className="h-3 bg-slate-200 rounded w-20" />
              </div>
            </div>
          </td>
          <td className="p-4">
            <div className="h-4 bg-slate-200 rounded w-24 mx-auto" />
          </td>
          <td className="p-4">
            <div className="h-4 bg-slate-200 rounded w-12 mx-auto" />
          </td>
          <td className="p-4">
            <div className="h-4 bg-slate-200 rounded w-20 mx-auto" />
          </td>
          <td className="p-4">
            <div className="h-4 bg-slate-200 rounded w-24 mx-auto" />
          </td>
          <td className="p-4">
            <div className="h-6 bg-slate-200 rounded-full w-16 mx-auto" />
          </td>
          <td className="p-4">
            <div className="size-6 bg-slate-200 rounded mx-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}
