"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { ImageUploadBox } from "@/components/shared/ImageUploadBox";
import {
  fetchHolidayParks,
  createHolidayPark,
  updateHolidayPark,
  deleteHolidayPark,
} from "../api/holiday-parks.api";
import { HolidayPark, CreateHolidayParkDto } from "../types/holiday-parks.types";
import {
  TreePine,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  ShieldAlert,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Home,
  CheckCircle2,
  Star,
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
  const [editingPark, setEditingPark] = useState<HolidayPark | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<HolidayPark | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateHolidayParkDto>({
    name: "",
    title: "",
    badgeLocation: "",
    shortDescription: "",
    startingPrice: 129,
    totalCapacity: "180 Guests",
    totalProperties: 10,
    checkInTime: "15:00",
    checkOutTime: "11:00",
    receptionHours: "24 Hours",
    coverImage: "",
    status: "Active",
    isFeatured: true,
  });

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

  const handleOpenAddModal = () => {
    setEditingPark(null);
    setFormData({
      name: "",
      title: "",
      badgeLocation: "VELUWE, NETHERLANDS",
      shortDescription: "A luxury holiday park surrounded by pristine nature.",
      startingPrice: 129,
      totalCapacity: "150 Guests",
      totalProperties: 12,
      checkInTime: "15:00",
      checkOutTime: "11:00",
      receptionHours: "24 Hours",
      coverImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600",
      status: "Active",
      isFeatured: true,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (park: HolidayPark) => {
    setEditingPark(park);
    setFormData({
      name: park.name || park.title,
      title: park.title,
      badgeLocation: park.badgeLocation || "",
      shortDescription: park.shortDescription || "",
      startingPrice: park.startingPrice,
      totalCapacity: park.totalCapacity || "100 Guests",
      totalProperties: park.totalProperties || 10,
      checkInTime: park.checkInTime || "15:00",
      checkOutTime: park.checkOutTime || "11:00",
      receptionHours: park.receptionHours || "24 Hours",
      coverImage: park.coverImage || "",
      status: park.status || "Active",
      isFeatured: park.isFeatured ?? true,
    });
    setIsAddModalOpen(true);
  };

  const handleSavePark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || (formData.startingPrice ?? 0) <= 0) {
      setError("Please provide a valid park title and positive starting price.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      if (editingPark) {
        await updateHolidayPark(editingPark._id, formData);
      } else {
        await createHolidayPark(formData);
      }
      setIsAddModalOpen(false);
      void loadParks();
    } catch (err: any) {
      console.error("Save holiday park error:", err);
      setError("Failed to save holiday park details.");
    } finally {
      setIsSaving(false);
    }
  };

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
      subtitle="Manage resort parks, amenities, check-in times, and park-level pricing."
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
              <span className="text-[10px] text-slate-500 font-medium">Resort Parks</span>
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
            </select>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={handleOpenAddModal}
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
                          {park.coverImage ? (
                            <img
                              src={park.coverImage}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <TreePine size={18} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-[#3b338c] transition-colors truncate">
                              {park.title || park.name}
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
                          <span>{park.location?.city ? `${park.location.city}, ${park.location.country || ''}` : (park.badgeLocation || "Netherlands")}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 group-hover:bg-[#3b338c] group-hover:text-white transition-colors text-xs">
                          <Home size={13} />
                          {park.totalProperties || 0} Properties
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {park.totalCapacity || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#3b338c]">
                        €{park.startingPrice} <span className="text-[10px] font-normal text-slate-400">/night</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${park.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
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
                            title="View park details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(park)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#3b338c] hover:bg-slate-100 transition-colors"
                            title="Edit park"
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

      {/* Add / Edit Park Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-sm">
                {editingPark ? "Edit Holiday Park" : "Add Holiday Park"}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePark} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Park Name / Title</label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value, name: e.target.value })}
                  className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#3b338c] outline-none"
                  placeholder="e.g. Nordic Pines Retreat"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Location Badge</label>
                  <input
                    value={formData.badgeLocation}
                    onChange={(e) => setFormData({ ...formData, badgeLocation: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#3b338c] outline-none"
                    placeholder="e.g. VELUWE, NETHERLANDS"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Starting Price (€/night)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.startingPrice}
                    onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#3b338c] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Check-In</label>
                  <input
                    value={formData.checkInTime}
                    onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                    className="w-full h-9 px-2 border border-slate-200 rounded-lg bg-slate-50 text-center outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Check-Out</label>
                  <input
                    value={formData.checkOutTime}
                    onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                    className="w-full h-9 px-2 border border-slate-200 rounded-lg bg-slate-50 text-center outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Reception</label>
                  <input
                    value={formData.receptionHours}
                    onChange={(e) => setFormData({ ...formData, receptionHours: e.target.value })}
                    className="w-full h-9 px-2 border border-slate-200 rounded-lg bg-slate-50 text-center outline-none"
                  />
                </div>
              </div>

              <ImageUploadBox
                label="Cover Image"
                hint="Upload image file or paste URL (recommended 600×400)"
                value={formData.coverImage || ""}
                onChange={(url) => setFormData({ ...formData, coverImage: url })}
                disabled={isSaving}
              />

              <div>
                <label className="block text-slate-600 font-medium mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#3b338c] outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#3b338c] hover:bg-[#2d2670] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Park"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Details Modal */}
      {viewingPark && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TreePine size={16} className="text-[#3b338c]" />
                <h3 className="font-bold text-slate-900 text-sm">Holiday Park Overview</h3>
              </div>
              <button onClick={() => setViewingPark(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              {viewingPark.coverImage && (
                <div className="relative">
                  <img src={viewingPark.coverImage} alt="" className="w-full h-40 rounded-xl object-cover border border-slate-100 shadow-xs" />
                  <span
                    className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-xs ${viewingPark.status === "Active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                  >
                    {viewingPark.status || "Active"}
                  </span>
                </div>
              )}
              <div>
                <div className="font-bold text-slate-900 text-base">{viewingPark.title || viewingPark.name}</div>
                <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin size={13} className="text-slate-400" /> <span>{viewingPark.badgeLocation || "Veluwe, Netherlands"}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Starting Rate</span>
                  <span className="font-bold text-[#3b338c] text-sm">€{viewingPark.startingPrice} <span className="text-[10px] font-normal text-slate-400">/nt</span></span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Lodges</span>
                  <span className="font-bold text-slate-900 text-sm">{viewingPark.totalProperties || 10} Units</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Capacity</span>
                  <span className="font-bold text-slate-900 text-sm">{viewingPark.totalCapacity || "150"}</span>
                </div>
              </div>

              <div className="space-y-1 text-slate-500 bg-slate-50/60 p-3 rounded-xl border border-slate-100 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Check-in / Check-out:</span>
                  <span className="font-semibold text-slate-700">{viewingPark.checkInTime || "15:00"} - {viewingPark.checkOutTime || "11:00"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Reception Desk:</span>
                  <span className="font-semibold text-slate-700">{viewingPark.receptionHours || "24 Hours"}</span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed font-normal">{viewingPark.shortDescription || "A luxury holiday park surrounded by pristine nature and peaceful woodlands."}</p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                onClick={() => {
                  setViewingPark(null);
                  router.push(`/dashboard/holiday-parks/${viewingPark._id}/properties`);
                }}
                className="px-4 py-2 bg-[#3b338c] hover:bg-[#2d2670] text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Home size={14} />
                <span>View Lodges ({viewingPark.totalProperties || 0})</span>
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
    </DashboardShell>
  );
}
