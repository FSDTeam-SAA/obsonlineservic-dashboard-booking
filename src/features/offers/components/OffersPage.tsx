"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Tag,
  Calendar,
  AlertCircle,
  Eye,
  X,
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { fetchOffers, deleteOffer } from "../api/offers.api";
import { Offer } from "../types/offers.types";
import { OffersTableSkeleton } from "./OffersTableSkeleton";

export function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Offer Modal State
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Action Menu / Delete modal state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchOffers({
        page,
        limit,
        search: searchTerm || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        offerType: typeFilter !== "All" ? (typeFilter as any) : undefined,
      });

      setOffers(res.items || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalCount(res.meta?.total || 0);
    } catch (err: any) {
      console.error("Failed to load offers:", err);
      setError(err?.response?.data?.message || "Failed to load promotional offers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOffers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, typeFilter, page]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the offer "${name}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteOffer(id);
      setActiveMenuId(null);
      loadOffers();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete offer.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "border-emerald-700 bg-emerald-100 text-emerald-700";
      case "Expired":
        return "border-rose-700 bg-rose-100 text-rose-700";
      case "Draft":
        return "border-amber-700 bg-amber-100 text-amber-700";
      case "Inactive":
      default:
        return "border-slate-400 bg-slate-100 text-slate-600";
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getAppliesTo = (offer: Offer) => {
    if (offer.scope === "entire_platform") return "Entire Platform";
    if (offer.scope === "holiday_parks") {
      if (offer.applicableParks?.length) {
        return `${offer.applicableParks.length} Holiday Park(s)`;
      }
      return "Holiday Parks";
    }
    if (offer.scope === "properties") {
      if (offer.applicableProperties?.length) {
        return `${offer.applicableProperties.length} Property(ies)`;
      }
      return "Selected Properties";
    }
    return "Custom Scope";
  };

  return (
    <DashboardShell
      active="Offers"
      title="Offers & Promotions"
      subtitle="Create and manage promotional campaigns for your holiday parks and properties."
    >
      <main className="grid gap-5 p-5 md:p-8 font-sans">
        {/* Controls Section */}
        <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            {/* Search Input */}
            <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-slate-400 focus-within:border-[#3b338c]">
              <Search size={18} />
              <span className="sr-only">Search offers</span>
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full text-sm text-slate-800 outline-none bg-transparent placeholder-slate-400"
                placeholder="Search offer name or code..."
              />
            </label>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 outline-none cursor-pointer pr-10 focus:border-[#3b338c]"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Expired">Expired</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 outline-none cursor-pointer pr-10 focus:border-[#3b338c]"
              >
                <option value="All">All Offer Types</option>
                <option value="percentage">Percentage Discount</option>
                <option value="fixed">Fixed Amount Discount</option>
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          <Link
            href="/dashboard/offers/create"
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#3b338c] hover:bg-[#2d276f] px-6 font-semibold text-white shadow-xs transition-colors shrink-0"
          >
            <Plus size={18} />
            Create Offer
          </Link>
        </section>

        {/* Offers Table */}
        {loading ? (
          <OffersTableSkeleton />
        ) : error ? (
          <div className="p-8 bg-white border border-slate-200 rounded-lg text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">{error}</p>
            <button
              onClick={() => loadOffers()}
              className="px-4 py-2 bg-[#3b338c] text-white text-xs font-semibold rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : offers.length === 0 ? (
          <div className="p-12 bg-white border border-slate-200 rounded-lg text-center space-y-3">
            <Tag className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Offers Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No promotional offers match your current criteria. Create a new campaign to boost bookings.
            </p>
          </div>
        ) : (
          <section className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-xs">
            <table className="min-w-[1000px] w-full border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="p-4 text-left font-semibold">Offer Name & Code</th>
                  <th className="p-4 text-center font-semibold">Discount</th>
                  <th className="p-4 text-center font-semibold">Applies To</th>
                  <th className="p-4 text-center font-semibold">Valid From</th>
                  <th className="p-4 text-center font-semibold">Valid Until</th>
                  <th className="p-4 text-center font-semibold">Status</th>
                  <th className="p-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offers.map((offer) => (
                  <tr
                    key={offer._id}
                    className="text-center text-sm hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="p-4 text-left">
                      <div className="font-semibold text-slate-900">{offer.offerName}</div>
                      {offer.offerCode && (
                        <span className="inline-block mt-0.5 font-mono text-[11px] bg-slate-100 text-[#3b338c] px-2 py-0.5 rounded border border-slate-200 font-bold">
                          {offer.offerCode}
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {offer.discountValue || (offer.offerType === "percentage" ? `${offer.discountPercentage}%` : `€${offer.fixedDiscount}`)}
                    </td>
                    <td className="p-4 text-slate-600 text-xs font-medium">
                      {getAppliesTo(offer)}
                    </td>
                    <td className="p-4 text-slate-600 text-xs">
                      {formatDate(offer.validFrom)}
                    </td>
                    <td className="p-4 text-slate-600 text-xs">
                      {formatDate(offer.validUntil)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${getStatusBadge(
                          offer.status
                        )}`}
                      >
                        {offer.status}
                      </span>
                    </td>
                    <td className="p-4 relative">
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === offer._id ? null : offer._id)
                        }
                        aria-label={`Actions for ${offer.offerName}`}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === offer._id && (
                        <div className="absolute right-4 top-12 z-20 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-left text-xs font-medium">
                          <button
                            onClick={() => {
                              setSelectedOffer(offer);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Eye size={14} />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={() => handleDelete(offer._id, offer.offerName)}
                            disabled={deletingId === offer._id}
                            className="w-full px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100"
                          >
                            <Trash2 size={14} />
                            <span>Delete Offer</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Pagination Section */}
        {totalCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs font-medium text-slate-500">
            <span>
              Showing {offers.length ? (page - 1) * limit + 1 : 0}–
              {Math.min(page * limit, totalCount)} of {totalCount} offers
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-semibold"
              >
                Previous
              </button>
              <span className="px-3 py-1.5">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Offer Details Modal Overlay */}
        {selectedOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedOffer.offerName}</h3>
                  {selectedOffer.offerCode && (
                    <span className="inline-block mt-1 font-mono text-[11px] bg-slate-100 text-[#3b338c] px-2 py-0.5 rounded border border-slate-200 font-bold">
                      {selectedOffer.offerCode}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOffer(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {selectedOffer.description && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Description</span>
                    <p className="text-slate-700">{selectedOffer.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block">Discount Type & Value</span>
                    <p className="font-bold text-slate-900 text-sm mt-1">
                      {selectedOffer.discountValue || (selectedOffer.offerType === "percentage" ? `${selectedOffer.discountPercentage}%` : `€${selectedOffer.fixedDiscount}`)}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                    <span className={`inline-block mt-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(selectedOffer.status)}`}>
                      {selectedOffer.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block">Min Booking Amount</span>
                    <p className="font-semibold text-slate-800 mt-1">
                      {selectedOffer.minBookingAmount ? `€${selectedOffer.minBookingAmount}` : "None"}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block">Max Discount Cap</span>
                    <p className="font-semibold text-slate-800 mt-1">
                      {selectedOffer.maxDiscount ? `€${selectedOffer.maxDiscount}` : "None"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block">Valid From</span>
                    <p className="font-semibold text-slate-800 mt-1">{formatDate(selectedOffer.validFrom)}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block">Valid Until</span>
                    <p className="font-semibold text-slate-800 mt-1">{formatDate(selectedOffer.validUntil)}</p>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block">Applies To</span>
                  <p className="font-semibold text-slate-800 mt-1">{getAppliesTo(selectedOffer)}</p>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedOffer(null)}
                  className="px-4 py-2 border border-slate-200 bg-white text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </DashboardShell>
  );
}
