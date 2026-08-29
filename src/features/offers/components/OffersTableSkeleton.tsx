import React from "react";

export function OffersTableSkeleton() {
  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 overflow-hidden animate-pulse">
      <div className="bg-slate-100 p-4 border-b border-slate-200 grid grid-cols-7 gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-4 bg-slate-200 rounded" />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="p-4 grid grid-cols-7 gap-4 items-center">
            <div className="h-4 bg-slate-200 rounded col-span-1" />
            <div className="h-4 bg-slate-200 rounded col-span-1" />
            <div className="h-4 bg-slate-200 rounded col-span-1" />
            <div className="h-4 bg-slate-200 rounded col-span-1" />
            <div className="h-4 bg-slate-200 rounded col-span-1" />
            <div className="h-6 w-16 bg-slate-200 rounded-full mx-auto" />
            <div className="h-5 w-5 bg-slate-200 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
