"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { fetchReviews, updateReview, deleteReview } from "../api/reviews.api";
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
  Pencil,
  Loader2,
  CheckCircle,
} from "lucide-react";

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | 0>(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Review | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit Form Fields
  const [editName, setEditName] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editIsPublished, setEditIsPublished] = useState(true);

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

  const handleOpenEdit = (rev: Review) => {
    setEditingReview(rev);
    setEditName(rev.name);
    setEditCountry(rev.country || "Netherlands");
    setEditRating(rev.rating);
    setEditComment(rev.comment);
    setEditIsPublished(rev.isPublished ?? true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    setSaving(true);
    setError(null);
    try {
      await updateReview(editingReview._id, {
        name: editName,
        country: editCountry,
        rating: editRating,
        comment: editComment,
        isPublished: editIsPublished,
      });
      setToastMessage(`Review for "${editName}" updated successfully.`);
      setEditingReview(null);
      void loadReviews();
    } catch (err: any) {
      console.error("Update review error:", err);
      setError(err?.response?.data?.message || "Failed to save review changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    setDeletingId(pendingDelete._id);
    try {
      await deleteReview(pendingDelete._id);
      setToastMessage(`Review by "${pendingDelete.name}" deleted successfully.`);
      setPendingDelete(null);
      void loadReviews();
    } catch (err: any) {
      console.error("Delete review error:", err);
      setError(err?.response?.data?.message || "Failed to delete review. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating: number, interactive = false, onSelect?: (r: number) => void) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 18 : 13}
            onClick={() => interactive && onSelect && onSelect(star)}
            className={`transition-colors ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200"
            } ${interactive ? "cursor-pointer hover:scale-110" : ""}`}
          />
        ))}
      </div>
    );
  };

  // Calculated Stats
  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : "4.9";
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;

  return (
    <DashboardShell
      active="Reviews"
      title="Guest Reviews & Moderation"
      subtitle="Inspect guest feedback, ratings, and moderate customer testimonials."
    >
      <main className="max-w-[1040px] p-5 md:p-8 space-y-6 font-sans">
        
        {/* KPI Stats Bar */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="size-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Star className="size-5.5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Satisfaction</span>
              <strong className="text-xl font-bold text-slate-900 block leading-tight">{avgRating} / 5.0</strong>
              <span className="text-[10px] text-slate-500 font-medium">Overall Rating Index</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="size-11 rounded-xl bg-violet-50 text-[#3b338c] flex items-center justify-center shrink-0 border border-violet-100">
              <MessageSquare className="size-5.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verified Reviews</span>
              <strong className="text-xl font-bold text-slate-900 block leading-tight">{totalCount}</strong>
              <span className="text-[10px] text-slate-500 font-medium">Customer Testimonials</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="size-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 className="size-5.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">5-Star Testimonials</span>
              <strong className="text-xl font-bold text-emerald-700 block leading-tight">{fiveStarCount}</strong>
              <span className="text-[10px] text-slate-500 font-medium">Top Rated Stays</span>
            </div>
          </div>
        </section>

        {/* Toast Message */}
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-900 p-1 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Directory Controls */}
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
                placeholder="Search reviews by guest name or comment..."
              />
            </label>

            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(Number(e.target.value));
                setPage(1);
              }}
              className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 outline-none focus:bg-white focus:border-[#3b338c] transition-all font-semibold cursor-pointer"
            >
              <option value={0}>All Ratings</option>
              <option value={5}>5 Stars Only</option>
              <option value={4}>4 Stars Only</option>
              <option value={3}>3 Stars Only</option>
              <option value={2}>1-2 Stars</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-normal self-end sm:self-center">
            Found <strong className="text-slate-700">{totalCount}</strong> reviews
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
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#3b338c] hover:bg-slate-100 transition-colors cursor-pointer"
                              title="View details"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(rev)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-violet-700 hover:bg-violet-50 transition-colors cursor-pointer"
                              title="Edit review"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setPendingDelete(rev)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
                className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-sm">Guest Review Details</h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = selectedReview;
                  setSelectedReview(null);
                  handleOpenEdit(target);
                }}
                className="px-4 py-2 bg-[#3b338c] hover:bg-[#2d276f] text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil size={13} />
                <span>Edit Review</span>
              </button>
              <button
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Edit Guest Review</h3>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Guest Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-lg outline-none bg-slate-50 focus:bg-white focus:border-[#3b338c] text-xs font-normal"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-lg outline-none bg-slate-50 focus:bg-white focus:border-[#3b338c] text-xs font-normal"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  {renderStars(editRating, true, (r) => setEditRating(r))}
                  <span className="font-bold text-slate-800 text-xs">{editRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Review Comment</label>
                <textarea
                  required
                  rows={4}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg outline-none bg-slate-50 focus:bg-white focus:border-[#3b338c] text-xs font-normal leading-relaxed"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editIsPublished}
                  onChange={(e) => setEditIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#3b338c] accent-[#3b338c]"
                />
                <span className="font-semibold text-slate-800">Publish Testimonial</span>
              </label>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 border border-slate-200 bg-white text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#3b338c] hover:bg-[#2d276f] text-white font-semibold rounded-lg text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center border border-red-100">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Delete Review?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently remove this review by <strong className="text-slate-800">"{pendingDelete.name}"</strong>?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === pendingDelete._id}
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                {deletingId === pendingDelete._id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
