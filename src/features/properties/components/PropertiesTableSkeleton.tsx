import React from "react";

export function PropertiesTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full bg-white overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-100 border-b border-slate-200" />
      <div className="divide-y divide-slate-200">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="size-[60px] rounded bg-slate-200 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
            </div>
            <div className="h-4 bg-slate-200 rounded w-20" />
            <div className="h-4 bg-slate-200 rounded w-16" />
            <div className="h-4 bg-slate-200 rounded w-16" />
            <div className="h-6 bg-slate-200 rounded-full w-20" />
            <div className="size-8 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
