import React from "react";

export function PropertiesStatSkeleton() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Loading property statistics">
      {[1, 2, 3, 4].map((i) => (
        <article
          key={i}
          className="animate-pulse rounded-lg border border-slate-200 bg-white p-4 shadow-2xs"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-7 w-12 rounded bg-slate-200" />
            </div>
            <div className="h-9 w-9 rounded-lg bg-slate-100" />
          </div>
        </article>
      ))}
    </section>
  );
}
