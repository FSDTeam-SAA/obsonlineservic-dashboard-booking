"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/shared/DashboardShell";
import {
  fetchHolidayParks,
  deleteHolidayPark,
} from "../api/holiday-parks.api";
import { HolidayPark } from "../types/holiday-parks.types";
import {
  TreePine,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  ShieldAlert,
  X,
  MapPin,
  Home,
  CheckCircle2,
  Star,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { HolidayParkTableSkeleton } from "./HolidayParkTableSkeleton";

export function HolidayParksPage() {
  const router = useRouter();
  const [parks, setParks] = useState<HolidayPark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal States
  const [viewingPark, setViewingPark] = useState<HolidayPark | null>(null);
  const [pendingDelete, setPendingDelete] = useState<HolidayPark | null>(null);

  const loadParks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchHolidayParks({
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter === "All" ? undefined : statusFilter,
      });

      if (response) {
        const items = response.items || (response as any).data?.items || [];
        const meta = response.meta || (response as any).data?.meta;
        setParks(items);
        setTotalPages(meta?.totalPages || 1);
        setTotalCount(meta?.total || items.length);
      }
    } catch (err: any) {
      console.error("Failed to load holiday parks:", err);
      setError("Unable to load holiday parks directory.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    void loadParks();
  }, [loadParks]);

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    try {
      await deleteHolidayPark(pendingDelete._id);
      setPendingDelete(null);
      void loadParks();
    } catch (err) {
      console.error("Delete park error:", err);
      setError("Failed to delete holiday park.");
    }
  };

  // Quick Stats
  const activeCount = parks.filter((p) => p.status === "Active").length;
  const totalPropsManaged = parks.reduce((sum, p) => sum + (p.totalProperties || 0), 0);
  const avgStartingRate = parks.length
    ? Math.round(parks.reduce((sum, p) => sum + (p.startingPrice || 129), 0) / parks.length)
    : 129;

  return (
    <DashboardShell
      active="Holiday Parks"
      title="Holiday Parks Management"
      subtitle="Manage resort parks, amenities, eco-badges, check-in times, and park-level pricing."
    >
      <main className="container p-5 md:p-8 space-y-6 font-sans">
        {/* KPI Stats Bar */}
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
            <div className="size-10 rounded-xl bg-violet-50 text-[#3b338c] flex items-center justify-center shrink-0 border border-violet-100">
              <TreePine className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Parks</span>
              <strong className="text-xl font-bold text-slate-900 block leading-tight">{totalCount}</strong>
              <span className="text-[10px] text-slate-500 font-medium">Resort Destinations</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
            <div className="size-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Parks</span>
              <strong className="text-xl font-bold text-emerald-700 block leading-tight">{activeCount}</strong>
              <span className="text-[10px] text-slate-500 font-medium">Live Bookable</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
            <div className="size-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
              <Home className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Managed Lodges</span>
              <strong className="text-xl font-bold text-blue-800 block leading-tight">{totalPropsManaged}</strong>
              <span className="text-[10px] text-slate-500 font-medium">Accommodations</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-3.5">
            <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Star className="size-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Rate</span>
              <strong className="text-xl font-bold text-slate-900 block leading-tight">€{avgStartingRate}</strong>
              <span className="text-[10px] text-slate-500 font-medium">Per Night</span>
            </div>
          </div>
        </section>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Directory Action Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-xl">
            <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-slate-400 focus-within:bg-white focus-within:border-[#3b338c] transition-all">
              <Search size={15} />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400 text-slate-700 font-normal"
                placeholder="Search holiday parks by name or location..."
              />
            </label>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 outline-none focus:bg-white focus:border-[#3b338c] transition-all font-semibold cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Draft">Draft Only</option>
              <option value="Archived">Archived Only</option>
            </select>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={() => router.push("/dashboard/holiday-parks/add")}
              className="h-10 px-4 bg-[#3b338c] hover:bg-[#2d2670] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={15} />
              <span>Add Holiday Park</span>
            </button>
          </div>
        </div>

        {/* Parks Directory Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <HolidayParkTableSkeleton />
          ) : parks.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <TreePine className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No holiday parks found</p>
              <p className="text-xs text-slate-400">
                Click "Add Holiday Park" to create a new park location.
              </p>
            </div>
          ) : (
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
                  {parks.map((park) => (
                    <tr
                      key={park._id}
                      className="hover:bg-violet-50/40 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/dashboard/holiday-parks/${park._id}/properties`)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {park.coverImage || park.heroBanner ? (
                            <img
                              src={park.coverImage || park.heroBanner}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <TreePine size={18} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-[#3b338c] transition-colors truncate flex items-center gap-1.5">
                              <span>{park.title || park.name}</span>
                              {park.isFeatured && (
                                <Star size={12} className="text-amber-500 fill-amber-400 shrink-0" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              ID: {park._id.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-medium flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          <span>
                            {park.location?.city
                              ? `${park.location.city}, ${park.location.country || ""}`
                              : park.badgeLocation || "Netherlands"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 group-hover:bg-[#3b338c] group-hover:text-white transition-colors text-xs">
                          <Home size={13} />
                          {park.totalProperties || 0} Lodges
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {park.totalCapacity || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#3b338c]">
                        {park.currency || "€"}{park.startingPrice} <span className="text-[10px] font-normal text-slate-400">/night</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            park.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : park.status === "Draft"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {park.status || "Active"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/dashboard/holiday-parks/${park._id}/properties`)}
                            className="h-8 px-2.5 rounded-lg text-xs font-semibold bg-[#3b338c]/10 text-[#3b338c] hover:bg-[#3b338c] hover:text-white transition-all flex items-center gap-1"
                            title="Manage properties under this park"
                          >
                            <Home size={13} />
                            <span>Properties</span>
                          </button>
                          <button
                            onClick={() => setViewingPark(park)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#3b338c] hover:bg-slate-100 transition-colors"
                            title="Quick View details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/holiday-parks/${park._id}/edit`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#3b338c] hover:bg-slate-100 transition-colors"
                            title="Edit park specification"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setPendingDelete(park)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete park"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Viewing Details Modal */}
      {viewingPark && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-100 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TreePine size={18} className="text-[#3b338c]" />
                <h3 className="font-bold text-slate-900 text-sm">Holiday Park Specifications</h3>
              </div>
              <button onClick={() => setViewingPark(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              {(viewingPark.coverImage || viewingPark.heroBanner) && (
                <div className="relative">
                  <img
                    src={viewingPark.coverImage || viewingPark.heroBanner}
                    alt=""
                    className="w-full h-44 rounded-xl object-cover border border-slate-100 shadow-xs"
                  />
                  <span
                    className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-xs ${
                      viewingPark.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {viewingPark.status || "Active"}
                  </span>
                </div>
              )}
              <div>
                <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>{viewingPark.title || viewingPark.name}</span>
                  {viewingPark.rating && (
                    <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                      <Star size={12} className="fill-amber-400" /> {viewingPark.rating} ({viewingPark.reviewsCount || 0})
                    </span>
                  )}
                </div>
                <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin size={13} className="text-slate-400" />
                  <span>
                    {viewingPark.location?.formattedAddress || viewingPark.badgeLocation || "Veluwe, Netherlands"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Starting Rate</span>
                  <span className="font-bold text-[#3b338c] text-sm">
                    {viewingPark.currency || "€"}{viewingPark.startingPrice} <span className="text-[10px] font-normal text-slate-400">/nt</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Properties</span>
                  <span className="font-bold text-slate-900 text-sm">{viewingPark.totalProperties || 0} Units</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Capacity</span>
                  <span className="font-bold text-slate-900 text-sm">{viewingPark.totalCapacity || "N/A"}</span>
                </div>
              </div>

              {viewingPark.ecoBadge?.title && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-emerald-800">
                  <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-600">
                      {viewingPark.ecoBadge.tagline || "CERTIFIED ECO-PARK"}
                    </span>
                    <strong className="text-xs font-semibold block">{viewingPark.ecoBadge.title}</strong>
                  </div>
                </div>
              )}

              {viewingPark.amenities?.length ? (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">General Amenities:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingPark.amenities.map((a, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {viewingPark.featuredAmenities?.length ? (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">Featured Highlights:</span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {viewingPark.featuredAmenities.map((item, i) => (
                      <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
                        <Sparkles size={14} className="text-[#3b338c] shrink-0" />
                        <div>
                          <strong className="text-[11px] text-slate-900 block">{item.title}</strong>
                          <span className="text-[10px] text-slate-500 block">{item.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <p className="text-slate-600 leading-relaxed font-normal">
                {viewingPark.shortDescription || viewingPark.fullDescription || "A luxury holiday park surrounded by pristine nature."}
              </p>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-100 gap-2">
              <button
                onClick={() => {
                  const id = viewingPark._id;
                  setViewingPark(null);
                  router.push(`/dashboard/holiday-parks/${id}/edit`);
                }}
                className="px-4 py-2 bg-[#3b338c] hover:bg-[#2d2670] text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Pencil size={14} />
                <span>Edit Full Spec</span>
              </button>

              <button
                onClick={() => setViewingPark(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-100 text-center font-sans">
            <div className="size-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Delete Holiday Park?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-800">{pendingDelete.title || pendingDelete.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Delete Park
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
