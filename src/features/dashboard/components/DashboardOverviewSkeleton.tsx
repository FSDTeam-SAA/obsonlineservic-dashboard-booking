import { DashboardShell } from "@/components/shared/DashboardShell";

export function DashboardOverviewSkeleton() {
  return (
    <DashboardShell
      active="Dashboard"
      title={
        <>
          Welcome back <span aria-hidden="true">👋</span>
        </>
      }
      subtitle="Manage your luxury holiday destinations from one beautiful workspace."
    >
      <main className="grid gap-6 p-5 md:p-8 animate-pulse">
        {/* Top 4 KPI Cards Skeleton */}
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <article
              key={i}
              className="relative overflow-hidden rounded border border-slate-200 bg-white p-7"
            >
              <div className="size-12 rounded-full bg-slate-200" />
              <div className="mt-4 h-4 w-28 rounded bg-slate-200" />
              <div className="mt-3 h-9 w-20 rounded bg-slate-300" />
              <div className="mt-3 h-3 w-36 rounded bg-slate-200" />
            </article>
          ))}
        </section>

        {/* Bookings Summary Banner Skeleton */}
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="h-6 w-48 rounded bg-slate-200 mb-6" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded bg-slate-50 p-4 border border-slate-100">
                <div className="h-3 w-24 rounded bg-slate-200" />
                <div className="mt-2 h-7 w-20 rounded bg-slate-300" />
                <div className="mt-2 h-3 w-32 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </section>

        {/* Performance Overview & Active Offers Skeleton */}
        <section className="grid gap-6 xl:grid-cols-2">
          {/* Performance Overview Skeleton */}
          <article className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="h-6 w-48 rounded bg-slate-200" />
              <div className="h-5 w-20 rounded bg-slate-200" />
            </div>
            <div className="mt-8 flex h-52 items-end gap-2 border-b border-slate-200 p-2">
              {[40, 60, 45, 75, 60, 90, 70, 95, 65, 80, 55, 70].map((h, idx) => (
                <div
                  key={idx}
                  style={{ height: `${h}%` }}
                  className="flex-1 rounded-t bg-slate-200"
                />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between rounded bg-slate-100 p-4">
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="h-5 w-24 rounded bg-slate-300" />
            </div>
          </article>

          {/* Active Offers Skeleton */}
          <article className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="h-6 w-36 rounded bg-slate-200" />
            <div className="mt-5 grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded border border-slate-200 p-4">
                  <div className="flex justify-between">
                    <div className="size-11 rounded-full bg-slate-200" />
                    <div className="h-6 w-12 rounded-full bg-slate-200" />
                  </div>
                  <div className="mt-4 h-5 w-48 rounded bg-slate-300" />
                  <div className="mt-2 h-4 w-20 rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-36 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </DashboardShell>
  );
}
