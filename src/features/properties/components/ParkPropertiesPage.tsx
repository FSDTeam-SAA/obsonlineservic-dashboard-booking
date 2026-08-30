"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { fetchPropertiesByPark, deleteProperty } from "../api/properties.api";
import { Property } from "../types/properties.types";
import {
  ChevronLeft,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  MapPin,
  Home,
  Users,
  ShieldAlert,
  TreePine,
  ExternalLink,
} from "lucide-react";

import { PropertiesTableSkeleton } from "./PropertiesTableSkeleton";

interface ParkPropertiesPageProps {
  parkId: string;
}

export function ParkPropertiesPage({ parkId }: ParkPropertiesPageProps) {
  const router = useRouter();
  const [park, setPark] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadParkProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPropertiesByPark(parkId, {
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter === "All" ? undefined : statusFilter,
      });

      if (res) {
        setPark(res.park);
        setProperties(res.items || []);
        setTotalPages(res.meta?.totalPages || 1);
      }
    } catch (err: any) {
      console.error("Failed to load park properties:", err);
      setError("Unable to load properties for this holiday park.");
    } finally {
      setLoading(false);
    }
  }, [parkId, page, search, statusFilter]);

  useEffect(() => {
    void loadParkProperties();
  }, [loadParkProperties]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      setIsDeleting(true);
      await deleteProperty(pendingDelete._id);
      setPendingDelete(null);
      await loadParkProperties();
    } catch (err) {
      console.error("Failed to delete property:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const parkTitle = park?.title || park?.name || "Holiday Park";
  const parkLocationStr = park?.location?.city
    ? `${park.location.city}, ${park.location.country || ""}`
    : park?.badgeLocation || "Netherlands";

  const activeCount = properties.filter((p) => p.status === "Active").length;
  const avgNightlyPrice = properties.length
    ? Math.round(properties.reduce((sum, p) => sum + (p.pricePerNight || 0), 0) / properties.length)
    : 0;

  return (
    <DashboardShell
      active="Holiday Parks"
      title={
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/holiday-parks"
            className="p-2 rounded-lg text-slate-400 hover:text-[#3b338c] hover:bg-slate-100 transition-colors"
            title="Back to Holiday Parks"
          >
            <ChevronLeft size={22} />
          </Link>
          <div>
            <div className="text-xs font-bold text-[#3b338c] uppercase tracking-wider">
              Holiday Park Properties
            </div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              {parkTitle}
            </h1>
          </div>
        </div>
      }
      subtitle={`Manage luxury accommodations located in ${parkLocationStr}`}
    >
      <main className="p-5 md:p-8 font-sans grid gap-6 max-w-7xl mx-auto">
        {/* Park Header Details Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {park?.coverImage ? (
              <img
                src={park.coverImage}
                alt={parkTitle}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-violet-50 flex items-center justify-center text-[#3b338c] shrink-0">
                <TreePine size={28} />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{parkTitle}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    park?.status === "Active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {park?.status || "Active"}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <MapPin size={13} className="text-slate-400" />
                  {parkLocationStr}
                </span>
                <span>•</span>
                <span className="font-semibold text-[#3b338c]">
                  {properties.length} Listings
                </span>
                {avgNightlyPrice > 0 && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-slate-600">
                      Avg €{avgNightlyPrice}/night
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {park?._id && (
              <a
                href={`/holiday-parks/${park._id}`}
                target="_blank"
                rel="noreferrer"
                className="h-11 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                title="Preview Holiday Park on Public Site"
              >
                <ExternalLink size={15} />
                <span>Preview Park</span>
              </a>
            )}
            <Link
              href={`/dashboard/holiday-parks/${parkId}/properties/add`}
              className="h-11 px-5 bg-[#3b338c] hover:bg-[#2d2670] text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={16} />
              <span>Add Property to Park</span>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="flex h-10 flex-1 sm:w-72 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-400 focus-within:bg-white focus-within:border-[#3b338c] transition-all">
              <Search size={15} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400 text-slate-700"
                placeholder="Search properties in this park..."
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
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{properties.length}</strong> properties
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          {loading ? (
            <PropertiesTableSkeleton rows={4} />
          ) : error ? (
            <div className="p-8 text-center text-red-600 text-xs font-semibold">
              {error}
            </div>
          ) : properties.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Home className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No properties in this park yet</p>
              <p className="text-xs text-slate-400">
                Click "Add Property to Park" to create the first lodge or villa.
              </p>
              <Link
                href={`/dashboard/holiday-parks/${parkId}/properties/add`}
                className="inline-flex h-9 px-4 bg-[#3b338c] text-white text-xs font-semibold rounded-lg items-center gap-1.5 mt-2"
              >
                <Plus size={14} /> Add Property
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Type / Category</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Price / Night</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {properties.map((prop) => (
                    <tr key={prop._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {prop.gallery?.main ? (
                            <img
                              src={prop.gallery.main}
                              alt=""
                              className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <Home size={18} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {prop.title}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <span className="font-semibold text-[#3b338c]">{prop.badge || "LODGE"}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {prop.category}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="flex items-center gap-1">
                            <Users size={13} className="text-slate-400" />
                            {prop.guests} Guests
                          </span>
                          <span>•</span>
                          <span>{prop.beds} Beds</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#3b338c]">
                        €{prop.pricePerNight} <span className="text-[10px] font-normal text-slate-400">/night</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            prop.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : prop.status === "Draft"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {prop.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`/property/${prop._id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#3b338c] hover:bg-slate-100 transition-colors"
                            title="View property on public site"
                          >
                            <Eye size={15} />
                          </a>
                          <Link
                            href={`/dashboard/holiday-parks/${parkId}/properties/${prop._id}/edit`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#3b338c] hover:bg-slate-100 transition-colors"
                            title="Edit property"
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            onClick={() => setPendingDelete(prop)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete property"
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

      {/* Delete Confirmation Modal */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Property?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-800">"{pendingDelete.title}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 h-10 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
