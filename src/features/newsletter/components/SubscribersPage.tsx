"use client";

import React, { useEffect, useState, useRef } from "react";
import { getNewsletterSubscribers } from "../api/newsletter.api";
import { NewsletterSubscriber } from "../types";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { SubscribersSkeleton } from "./SubscribersSkeleton";
import { Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, ShieldAlert, BadgeInfo, Download } from "lucide-react";

// Local translation dictionary mapping for future i18n extraction
const dictionary = {
  en: {
    title: "Newsletter Subscribers",
    subtitle: "Monitor and manage audience email subscriptions.",
    searchPlaceholder: "Search subscribers by email...",
    filterAll: "All Status",
    filterActive: "Active Only",
    filterInactive: "Inactive Only",
    colEmail: "Email Address",
    colStatus: "Status",
    colSubscribedAt: "Subscribed At",
    badgeActive: "Active",
    badgeInactive: "Inactive",
    totalFound: "Found {count} subscribers",
    noSubscribers: "No subscribers found",
    noSubscribersDesc: "We couldn't find any subscribers matching your criteria.",
    errorFetch: "Could not retrieve newsletter subscriber directory.",
    pageInfo: "Page {page} of {pages}",
    btnPrev: "Previous",
    btnNext: "Next",
    btnExport: "Export CSV",
  }
};

const activeLang = "en";
const t = dictionary[activeLang];

export function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [processedSubscribers, setProcessedSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingWorker, setLoadingWorker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter and Query states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const workerRef = useRef<Worker | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../api/newsletter.worker.ts", import.meta.url)
    );

    workerRef.current.onmessage = (event: MessageEvent<NewsletterSubscriber[]>) => {
      setProcessedSubscribers(event.data);
      setTotalCount(event.data.length);
      setTotalPages(Math.ceil(event.data.length / 10));
      setLoadingWorker(false);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Fetch subscribers list
  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getNewsletterSubscribers();
      if (res.data) {
        setSubscribers(res.data || []);
      }
    } catch (err: any) {
      console.error("Failed to fetch subscribers:", err);
      setError(err?.response?.data?.message || t.errorFetch);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Trigger worker when inputs change
  useEffect(() => {
    if (!workerRef.current) return;
    setLoadingWorker(true);
    workerRef.current.postMessage({
      subscribers,
      search,
      status: statusFilter,
    });
    setPage(1); // reset to first page on search/filter change
  }, [subscribers, search, statusFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleExportCSV = () => {
    if (processedSubscribers.length === 0) return;

    const headers = ["Email Address", "Status", "Subscribed At"];
    const rows = processedSubscribers.map((sub) => [
      `"${sub.email}"`,
      sub.isActive ? "Active" : "Inactive",
      `"${new Date(sub.createdAt).toLocaleString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get current page slice
  const itemsPerPage = 10;
  const startIndex = (page - 1) * itemsPerPage;
  const currentSubscribers = processedSubscribers.slice(startIndex, startIndex + itemsPerPage);

  const isListEmpty = !loading && !loadingWorker && currentSubscribers.length === 0;

  return (
    <DashboardShell active="Newsletter" title={t.title} subtitle={t.subtitle}>
      <main className="max-w-[1040px] p-5 md:p-8 space-y-6">
        
        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-650 text-xs rounded-xl p-4 flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Directory Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-xl">
            <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-slate-400 focus-within:bg-white focus-within:border-[#3b338c] transition-all">
              <Search size={15} />
              <input
                value={search}
                onChange={handleSearchChange}
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400 text-slate-700 font-normal"
                placeholder={t.searchPlaceholder}
              />
            </label>

            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 outline-none focus:bg-white focus:border-[#3b338c] transition-all font-semibold"
            >
              <option value="All">{t.filterAll}</option>
              <option value="Active">{t.filterActive}</option>
              <option value="Inactive">{t.filterInactive}</option>
            </select>
          </div>
          
          <div className="flex items-center gap-4 self-end sm:self-center">
            <div className="text-xs text-slate-400 font-normal">
              {t.totalFound.replace("{count}", String(totalCount))}
            </div>

            <button
              type="button"
              disabled={processedSubscribers.length === 0}
              onClick={handleExportCSV}
              className="h-10 px-3.5 border border-slate-200 bg-white hover:bg-slate-50 text-[#3b338c] font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              <Download size={14} />
              <span>{t.btnExport}</span>
            </button>
          </div>
        </div>

        {/* Subscribers Table / List */}
        {loading || loadingWorker ? (
          <SubscribersSkeleton />
        ) : isListEmpty ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-3">
            <BadgeInfo className="w-10 h-10 text-slate-350 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">{t.noSubscribers}</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {t.noSubscribersDesc}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-150 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">{t.colEmail}</th>
                    <th className="py-4 px-6">{t.colStatus}</th>
                    <th className="py-4 px-6">{t.colSubscribedAt}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-normal text-slate-750">
                  {currentSubscribers.map((sub) => (
                    <tr key={sub._id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-800">{sub.email}</td>
                      <td className="py-4 px-6">
                        {sub.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-200 uppercase tracking-wider">
                            <CheckCircle2 className="size-3 text-green-600" /> {t.badgeActive}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-400 border border-slate-150 uppercase tracking-wider">
                            <XCircle className="size-3 text-slate-300" /> {t.badgeInactive}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(sub.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <footer className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[11px] text-slate-550 font-normal">
                  {t.pageInfo.replace("{page}", String(page)).replace("{pages}", String(totalPages))}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="h-8 px-3 border border-slate-200 bg-white text-slate-650 rounded-lg text-[10px] font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <ChevronLeft className="size-3.5" /> {t.btnPrev}
                  </button>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className="h-8 px-3 border border-slate-200 bg-white text-slate-650 rounded-lg text-[10px] font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    {t.btnNext} <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </footer>
            )}
          </div>
        )}
      </main>
    </DashboardShell>
  );
}
