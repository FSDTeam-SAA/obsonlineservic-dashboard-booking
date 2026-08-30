"use client";

import React from "react";

export function OffersTableSkeleton() {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-pulse">
      {/* Header bar skeleton */}
      <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-7 gap-4">
        <div className="h-4 bg-slate-200 rounded-md col-span-2" />
        <div className="h-4 bg-slate-200 rounded-md col-span-1 text-center" />
        <div className="h-4 bg-slate-200 rounded-md col-span-1 text-center" />
        <div className="h-4 bg-slate-200 rounded-md col-span-1 text-center" />
        <div className="h-4 bg-slate-200 rounded-md col-span-1 text-center" />
        <div className="h-4 bg-slate-200 rounded-md col-span-1 text-center" />
      </div>
      {/* Rows skeleton */}
      <div className="divide-y divide-slate-100">
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="p-4 grid grid-cols-7 gap-4 items-center">
            <div className="col-span-2 space-y-2">
              <div className="h-4 bg-slate-200 rounded-md w-3/4" />
              <div className="h-3 bg-slate-150 rounded-md w-1/3" />
            </div>
            <div className="col-span-1 flex justify-center">
              <div className="h-5 bg-slate-200 rounded-lg w-16" />
            </div>
            <div className="col-span-1 flex justify-center">
              <div className="h-5 bg-slate-200 rounded-full w-24" />
            </div>
            <div className="col-span-1 flex flex-col items-center space-y-1">
              <div className="h-3 bg-slate-200 rounded-md w-20" />
              <div className="h-1.5 bg-slate-150 rounded-full w-full" />
            </div>
            <div className="col-span-1 flex justify-center">
              <div className="h-5 bg-slate-200 rounded-full w-16" />
            </div>
            <div className="col-span-1 flex justify-end">
              <div className="h-7 w-7 bg-slate-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
