"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Plus,
  Search,
  Trash2,
  Tag,
  Calendar,
  AlertCircle,
  Eye,
  Edit,
  X,
  Loader2,
  CheckCircle,
  Globe,
  Trees,
  Home,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Percent,
  Euro,
  Users,
  Clock,
  Filter,
} from "lucide-react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { fetchOffers, deleteOffer } from "../api/offers.api";
import { Offer } from "../types/offers.types";
import { OffersTableSkeleton } from "./OffersTableSkeleton";
import { OfferDetailsModal } from "./OfferDetailsModal";
import { EditOfferModal } from "./EditOfferModal";

export function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Modals
  const [viewingOffer, setViewingOffer] = useState<Offer | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Offer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [scopeFilter, setScopeFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchOffers({
        page,
        limit,
        search: searchTerm || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        scope: scopeFilter !== "All" ? (scopeFilter as any) : undefined,
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
  }, [searchTerm, statusFilter, scopeFilter, typeFilter, page]);

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;

    try {
      setDeletingId(pendingDelete._id);
      await deleteOffer(pendingDelete._id);
      setToastMessage(`Offer "${pendingDelete.offerName}" deleted successfully.`);
      if (viewingOffer?._id === pendingDelete._id) {
        setViewingOffer(null);
      }
      setPendingDelete(null);
      loadOffers();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete offer.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyCode = (offerId: string, code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCodeId(offerId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Expired":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Draft":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Inactive":
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
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

  const renderScopeBadge = (offer: Offer) => {
    if (offer.scope === "entire_platform") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
          <Globe size={13} className="text-purple-600 shrink-0" />
          Entire Platform
        </span>
      );
    }
    if (offer.scope === "holiday_parks") {
      const parkCount = offer.applicableParks?.length || offer.applicableParkNames?.length || 0;
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <Trees size={13} className="text-emerald-600 shrink-0" />
          {parkCount > 0 ? `${parkCount} Holiday Park(s)` : "Holiday Parks"}
        </span>
      );
    }
    if (offer.scope === "properties") {
      const propCount = offer.applicableProperties?.length || 0;
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
          <Home size={13} className="text-indigo-600 shrink-0" />
          {propCount > 0 ? `${propCount} Property(ies)` : "Properties"}
        </span>
      );
    }
    return <span className="text-xs text-slate-500">Custom Scope</span>;
  };

  // Stats calculation
  const activeCount = offers.filter((o) => o.status === "Active").length;
  const globalCount = offers.filter((o) => o.scope === "entire_platform").length;
  const expiredCount = offers.filter((o) => o.status === "Expired").length;

  return (
    <DashboardShell
      active="Offers"
      title="Offers & Promotions"
      subtitle="Manage promotional discount codes, targeted holiday park deals, and seasonal campaigns."
    >
      <main className="grid gap-6 p-5 md:p-8 font-sans max-w-7xl mx-auto">
        
        {/* Toast Alert Banner */}
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl p-4 flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-600 hover:text-emerald-900 p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Top Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#3b338c] flex items-center justify-center shrink-0 border border-indigo-100">
              <Tag size={22} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Campaigns</span>
              <h3 className="text-2xl font-black text-slate-900">{totalCount}</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <TrendingUp size={22} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Offers</span>
              <h3 className="text-2xl font-black text-emerald-700">{activeCount}</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <Globe size={22} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform-wide Scope</span>
              <h3 className="text-2xl font-black text-purple-700">{globalCount}</h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <Clock size={22} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Expired / Inactive</span>
              <h3 className="text-2xl font-black text-rose-700">{expiredCount}</h3>
            </div>
          </div>
        </section>

        {/* Filter & Actions Bar */}
        <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Search Input */}
            <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-slate-400 focus-within:border-[#3b338c] focus-within:ring-2 focus-within:ring-[#3b338c]/10 transition-all">
              <Search size={16} />
              <span className="sr-only">Search offers</span>
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs text-slate-800 outline-none bg-transparent placeholder-slate-400 font-medium"
                placeholder="Search offer name or promo code..."
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </label>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer pr-9 focus:border-[#3b338c]"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Expired">Expired</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"
              />
            </div>

            {/* Scope Filter */}
            <div className="relative">
              <select
                value={scopeFilter}
                onChange={(e) => {
                  setScopeFilter(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer pr-9 focus:border-[#3b338c]"
              >
                <option value="All">All Scope Levels</option>
                <option value="entire_platform">Entire Platform</option>
                <option value="holiday_parks">Holiday Parks</option>
                <option value="properties">Properties</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"
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
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer pr-9 focus:border-[#3b338c]"
              >
                <option value="All">All Discount Types</option>
                <option value="percentage">Percentage Discount</option>
                <option value="fixed">Fixed Amount Discount</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => loadOffers()}
              title="Refresh table data"
              className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>

            <Link
              href="/dashboard/offers/create"
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3b338c] hover:bg-[#2d276f] px-5 font-bold text-white text-xs shadow-md transition-all cursor-pointer hover:shadow-lg"
            >
              <Plus size={16} />
              Create Offer
            </Link>
          </div>
        </section>

        {/* Offers Data Table */}
        {loading ? (
          <OffersTableSkeleton />
        ) : error ? (
          <div className="p-10 bg-white border border-slate-200 rounded-2xl text-center space-y-3 shadow-xs">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Failed to Load Offers</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => loadOffers()}
              className="px-5 py-2.5 bg-[#3b338c] text-white text-xs font-bold rounded-xl hover:bg-[#2d276f] transition-colors cursor-pointer shadow-xs"
            >
              Try Again
            </button>
          </div>
        ) : offers.length === 0 ? (
          <div className="p-14 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#3b338c] flex items-center justify-center mx-auto border border-indigo-100">
              <Tag size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">No Promotional Offers Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchTerm || statusFilter !== "All" || scopeFilter !== "All"
                  ? "No offers match your current filter parameters. Try resetting your search."
                  : "No promotional campaigns created yet. Click 'Create Offer' to launch your first deal."}
              </p>
            </div>
            <Link
              href="/dashboard/offers/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3b338c] text-white text-xs font-bold rounded-xl hover:bg-[#2d276f] transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={16} />
              Create First Offer
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Offer Name & Promo Code</th>
                    <th className="py-3.5 px-4 text-center">Discount</th>
                    <th className="py-3.5 px-4 text-center">Applies To</th>
                    <th className="py-3.5 px-4 text-center">Campaign Capacity</th>
                    <th className="py-3.5 px-4 text-center">Validity Window</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {offers.map((offer) => {
                    const maxUses = offer.maxUses || 0;
                    const usedCount = offer.usedCount || 0;
                    const usagePct = maxUses > 0 ? Math.min(100, Math.round((usedCount / maxUses) * 100)) : 0;

                    return (
                      <tr
                        key={offer._id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Offer Name & Code */}
                        <td className="py-4 px-5">
                          <div className="flex flex-col space-y-1">
                            <button
                              type="button"
                              onClick={() => setViewingOffer(offer)}
                              className="text-left font-bold text-slate-900 group-hover:text-[#3b338c] transition-colors cursor-pointer hover:underline text-sm"
                            >
                              {offer.offerName}
                            </button>

                            <div className="flex items-center gap-2 flex-wrap">
                              {offer.offerCode ? (
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(offer._id, offer.offerCode)}
                                  className="inline-flex items-center gap-1 font-mono text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200 font-bold transition-all cursor-pointer"
                                  title="Click to copy code"
                                >
                                  <Tag size={11} className="text-amber-700" />
                                  <span>{offer.offerCode}</span>
                                  {copiedCodeId === offer._id ? (
                                    <Check size={11} className="text-emerald-600" />
                                  ) : (
                                    <Copy size={11} className="text-amber-600 opacity-60" />
                                  )}
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">No Promo Code</span>
                              )}

                              {offer.description && (
                                <span className="text-[11px] text-slate-500 truncate max-w-[220px]">
                                  • {offer.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Discount */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1">
                              {offer.offerType === "percentage" ? (
                                <Percent size={13} className="text-[#3b338c]" />
                              ) : (
                                <Euro size={13} className="text-[#3b338c]" />
                              )}
                              {offer.discountValue || (offer.offerType === "percentage" ? `${offer.discountPercentage}%` : `€${offer.fixedDiscount}`)}
                            </span>
                            {offer.minBookingAmount ? (
                              <span className="text-[10px] text-slate-400 font-normal">
                                Min: €{offer.minBookingAmount}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-normal">No Min</span>
                            )}
                          </div>
                        </td>

                        {/* Scope & Destinations */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex justify-center">
                            {renderScopeBadge(offer)}
                          </div>
                        </td>

                        {/* Capacity Progress */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex flex-col items-center space-y-1 min-w-[110px]">
                            <span className="text-[11px] font-bold text-slate-700">
                              {usedCount} / {maxUses > 0 ? maxUses : "∞"}
                            </span>
                            {maxUses > 0 && (
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    usagePct > 90 ? "bg-rose-500" : usagePct > 60 ? "bg-amber-500" : "bg-[#3b338c]"
                                  }`}
                                  style={{ width: `${usagePct}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Validity Window */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center space-y-0.5">
                            <span className="text-[11px] font-semibold text-slate-800">
                              {formatDate(offer.validFrom)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              to {formatDate(offer.validUntil)}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-block rounded-full border px-3 py-0.5 text-[11px] font-bold ${getStatusBadge(
                              offer.status
                            )}`}
                          >
                            {offer.status}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingOffer(offer)}
                              title="View details & scope"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#3b338c] hover:bg-indigo-50 border border-slate-200 transition-colors cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => setEditingOffer(offer)}
                              title="Edit offer parameters"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors cursor-pointer"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => setPendingDelete(offer)}
                              title="Delete offer"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalCount > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-t border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50/50">
                <span>
                  Showing {offers.length ? (page - 1) * limit + 1 : 0}–
                  {Math.min(page * limit, totalCount)} of {totalCount} total campaigns
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="px-2">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Offer Details Modal */}
        <OfferDetailsModal
          offer={viewingOffer}
          onClose={() => setViewingOffer(null)}
          onEdit={(off) => {
            setViewingOffer(null);
            setEditingOffer(off);
          }}
          onDelete={(off) => {
            setViewingOffer(null);
            setPendingDelete(off);
          }}
        />

        {/* Edit Offer Modal */}
        <EditOfferModal
          offer={editingOffer}
          isOpen={!!editingOffer}
          onClose={() => setEditingOffer(null)}
          onSuccess={(updated) => {
            setToastMessage(`Offer "${updated.offerName}" updated successfully.`);
            loadOffers();
          }}
        />

        {/* Delete Confirmation Modal */}
        {pendingDelete && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-100">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Delete Offer Campaign?</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Are you sure you want to permanently delete <strong className="text-slate-800">"{pendingDelete.offerName}"</strong>? This will remove the promotional discount code and cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deletingId === pendingDelete._id}
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {deletingId === pendingDelete._id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    "Delete Offer"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </DashboardShell>
  );
}
