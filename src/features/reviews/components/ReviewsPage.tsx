"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { fetchReviews, deleteReview } from "../api/reviews.api";
import { Review } from "../types/reviews.types";
import {
  Star,
  Search,
  Trash2,
  Eye,
  MessageSquare,
  ShieldAlert,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CheckCircle2,
} from "lucide-react";

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | 0>(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Review | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchReviews({
        page,
        limit: 10,
        rating: ratingFilter > 0 ? ratingFilter : undefined,
        search: search.trim() || undefined,
      });

      if (response) {
        const items = response.items || (response as any).data?.items || [];
        const meta = response.meta || (response as any).data?.meta;
        setReviews(items);
        setTotalPages(meta?.totalPages || 1);
        setTotalCount(meta?.total || items.length);
      }
    } catch (err: any) {
      console.error("Failed to load reviews:", err);
      setError("Unable to load guest reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, ratingFilter, search]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    setDeletingId(pendingDelete._id);
    try {
      await deleteReview(pendingDelete._id);
      setPendingDelete(null);
      void loadReviews();
    } catch (err) {
      console.error("Delete review error:", err);
      setError("Failed to delete review. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={13}
            className={
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200"
            }
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardShell
      active="Reviews"
      title="Guest Reviews & Moderation"
      subtitle="Inspect guest feedback, ratings, and moderate customer testimonials."
    >
      <main className="max-w-[1040px] p-5 md:p-8 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Directory Controls */}
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
                placeholder="Search reviews by guest name or comment..."
              />
            </label>

            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(Number(e.target.value));
                setPage(1);
              }}
              className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 outline-none focus:bg-white focus:border-[#3b338c] transition-all font-semibold"
            >
              <option value={0}>All Ratings</option>
              <option value={5}>5 Stars Only</option>
              <option value={4}>4 Stars Only</option>
              <option value={3}>3 Stars Only</option>
              <option value={2}>1-2 Stars</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-normal self-end sm:self-center">
            Found {totalCount} reviews
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs animate-pulse">
              Loading guest reviews directory...
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No reviews found</p>
              <p className="text-xs text-slate-400">
                Try adjusting your search query or rating filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Comment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {reviews.map((rev) => {
                    const propertyTitle =
                      typeof rev.property === "object" && rev.property !== null
                        ? rev.property.title
                        : "Property";

                    return (
                      <tr key={rev._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div>{rev.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} />
                            {rev.country}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate font-medium">
                          {propertyTitle}
                        </td>
                        <td className="py-3.5 px-4">{renderStars(rev.rating)}</td>
                        <td className="py-3.5 px-4 max-w-[280px] truncate text-slate-500">
                          "{rev.comment}"
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedReview(rev)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#3b338c] hover:bg-slate-100 transition-colors"
                              title="View details"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => setPendingDelete(rev)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete review"
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
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-sm">Guest Review Details</h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{selectedReview.name}</div>
                  <div className="text-slate-400">{selectedReview.country}</div>
                </div>
                {renderStars(selectedReview.rating)}
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Target Property</span>
                <div className="font-medium text-slate-800">
                  {typeof selectedReview.property === "object" && selectedReview.property !== null
                    ? selectedReview.property.title
                    : selectedReview.property}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Full Comment Text</span>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 italic leading-relaxed">
                  "{selectedReview.comment}"
                </p>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Submitted On</span>
                <div>{new Date(selectedReview.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Delete Review?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently remove this review by "{pendingDelete.name}"?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deletingId === pendingDelete._id}
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {deletingId === pendingDelete._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
