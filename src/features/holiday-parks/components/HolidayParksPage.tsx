"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DashboardShell } from "@/components/shared/DashboardShell";
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

export function HolidayParksPage() {
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

      if (response && response.data) {
        setParks(response.data.items || []);
        setTotalPages(response.data.meta?.totalPages || 1);
        setTotalCount(response.data.meta?.total || 0);
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

  return (
    <DashboardShell
      active="Properties"
      title="Holiday Parks Management"
      subtitle="Manage resort parks, amenities, check-in times, and park-level pricing."
    >
      <main className="max-w-[1040px] p-5 md:p-8 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 p-1">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Directory Action Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-xl">
            <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-slate-400 focus-within:bg-white focus-within:border-[#3b338c] transition-all">
              <Search size={15} />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400 text-slate-700"
                placeholder="Search holiday parks by name or location..."
              />
            </label>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 outline-none focus:bg-white focus:border-[#3b338c] transition-all font-semibold"
            >
              <option value="All">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Draft">Draft Only</option>
            </select>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={handleOpenAddModal}
              className="h-10 px-4 bg-[#3b338c] hover:bg-[#2d2670] text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={15} />
              <span>Add Holiday Park</span>
            </button>
          </div>
        </div>

        {/* Parks Directory Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs animate-pulse">
              Loading holiday parks directory...
            </div>
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
                    <th className="py-3 px-4">Park Location</th>
                    <th className="py-3 px-4">Properties</th>
                    <th className="py-3 px-4">Check-In / Out</th>
                    <th className="py-3 px-4">Starting Rate</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {parks.map((park) => (
                    <tr key={park._id} className="hover:bg-slate-50/80 transition-colors">
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
                            <div className="font-semibold text-slate-900 truncate">
                              {park.title || park.name}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={10} />
                              {park.badgeLocation || "Netherlands"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Home size={13} className="text-slate-400" />
                          <span>{park.totalProperties || 10} Units</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" />
                          <span>{park.checkInTime || "15:00"} / {park.checkOutTime || "11:00"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#3b338c]">
                        €{park.startingPrice} <span className="text-[10px] font-normal text-slate-400">/night</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            park.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {park.status || "Active"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
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

              <div>
                <label className="block text-slate-600 font-medium mb-1">Cover Image URL</label>
                <input
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#3b338c] outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-sm">Holiday Park Overview</h3>
              <button onClick={() => setViewingPark(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              {viewingPark.coverImage && (
                <img src={viewingPark.coverImage} alt="" className="w-full h-36 rounded-xl object-cover border border-slate-100" />
              )}
              <div className="font-bold text-slate-900 text-base">{viewingPark.title || viewingPark.name}</div>
              <div className="text-slate-400 flex items-center gap-1">
                <MapPin size={12} /> {viewingPark.badgeLocation || "Veluwe, Netherlands"}
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block">Starting Rate</span>
                  <span className="font-semibold text-slate-900">€{viewingPark.startingPrice} / night</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Properties</span>
                  <span className="font-semibold text-slate-900">{viewingPark.totalProperties || 10} Units</span>
                </div>
              </div>

              <p className="text-slate-700 italic">{viewingPark.shortDescription || "No description provided."}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingPark(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
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
