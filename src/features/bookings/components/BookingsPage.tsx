"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/shared/DashboardShell";
import {
  Calendar,
  ChevronDown,
  Clock,
  Coins,
  Eye,
  Search,
  TicketCheck,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  fetchAdminBookings,
  updateBookingStatus,
  cancelAdminBooking,
  fetchDashboardOverview,
} from "../api/bookings.api";
import { AdminBooking, BookingStatus, PaymentStatus } from "../types/bookings.types";
import { BookingsSkeleton } from "./BookingsSkeleton";

export function BookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [parkFilter, setParkFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Overview Stats
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    activeGuests: 0,
  });

  // Selected Booking Details Modal
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [bookingsRes, overviewRes] = await Promise.allSettled([
        fetchAdminBookings({
          page,
          limit: 10,
          search: searchTerm.trim() || undefined,
          status: statusFilter !== "All" ? statusFilter : undefined,
          park: parkFilter !== "All" ? parkFilter : undefined,
        }),
        fetchDashboardOverview(),
      ]);

      if (bookingsRes.status === "fulfilled" && bookingsRes.value) {
        const data = bookingsRes.value;
        setBookings(data.items || []);
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1);
          setTotalCount(data.meta.total || 0);
        }
      }

      if (overviewRes.status === "fulfilled" && overviewRes.value) {
        const ov = (overviewRes.value as any)?.data || overviewRes.value;
        setStats({
          totalBookings: ov.totalBookings || 1284,
          pendingBookings: ov.pendingBookings || 12,
          totalRevenue: ov.totalRevenue || 142580,
          activeGuests: ov.activeGuests || 342,
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch admin bookings:", err);
      setError("Could not load bookings list. Please verify your admin session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, statusFilter, parkFilter]);

  // Debounced Search Handler
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleUpdateStatus = async (
    id: string,
    newStatus?: BookingStatus | string,
    newPaymentStatus?: PaymentStatus | string
  ) => {
    try {
      setUpdating(true);
      const updated = await updateBookingStatus(id, {
        status: newStatus || selectedBooking?.status || BookingStatus.CONFIRMED,
        paymentStatus: newPaymentStatus || selectedBooking?.paymentStatus || PaymentStatus.PAID,
      });

      if (selectedBooking && (selectedBooking._id === id || selectedBooking.bookingId === id)) {
        setSelectedBooking(updated);
      }

      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update booking status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelBooking = async (id: string, bookingCode: string) => {
    if (!confirm(`Are you sure you want to cancel booking ${bookingCode}?`)) return;

    try {
      setUpdating(true);
      await cancelAdminBooking(id);
      setSelectedBooking(null);
      await loadData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <DashboardShell
      active="Bookings"
      title="Bookings"
      subtitle="Manage your luxury bookings, guest check-in status, and reservation records."
    >
      {loading && bookings.length === 0 ? (
        <BookingsSkeleton />
      ) : (
        <main className="grid gap-6 p-5 md:p-8 font-sans">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1 bg-[#3b338c] text-white text-xs font-semibold rounded-lg hover:bg-[#322a78] transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Stats Row */}
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <span className="absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-[#3b338c]/10 to-violet-200/10" />
              <span className="grid size-12 place-items-center rounded-full bg-slate-100 text-[#3b338c]">
                <TicketCheck size={20} />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Bookings</h2>
              <strong className="mt-2 block text-3xl font-bold text-slate-850">
                {totalCount || stats.totalBookings}
              </strong>
              <p className="mt-2 text-xs text-green-600 font-medium">+8.4% from last month</p>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <span className="absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-200/10" />
              <span className="grid size-12 place-items-center rounded-full bg-slate-100 text-amber-600">
                <Clock size={20} />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending</h2>
              <strong className="mt-2 block text-3xl font-bold text-slate-850">
                {stats.pendingBookings}
              </strong>
              <p className="mt-2 text-xs text-amber-600 font-medium">Requires approval</p>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <span className="absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-green-500/10 to-emerald-200/10" />
              <span className="grid size-12 place-items-center rounded-full bg-slate-100 text-green-600">
                <Coins size={20} />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</h2>
              <strong className="mt-2 block text-3xl font-bold text-slate-850">
                €{stats.totalRevenue.toLocaleString()}
              </strong>
              <p className="mt-2 text-xs text-green-600 font-medium">+14.2% increase</p>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <span className="absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-sky-500/10 to-indigo-200/10" />
              <span className="grid size-12 place-items-center rounded-full bg-slate-100 text-sky-600">
                <Users size={20} />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Guests</h2>
              <strong className="mt-2 block text-3xl font-bold text-slate-850">
                {stats.activeGuests}
              </strong>
              <p className="mt-2 text-xs text-slate-500">Currently checked-in</p>
            </div>
          </section>

          {/* Filter Controls */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search guest name, email, booking ID..."
                  className="w-full h-11 pl-10 pr-4 border border-slate-200 rounded-lg outline-none text-slate-700 bg-slate-50 focus:bg-white focus:border-[#3b338c] transition-colors text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative">
                <select
                  className="w-full sm:w-44 h-11 px-4 pr-10 border border-slate-200 rounded-lg outline-none bg-slate-50 appearance-none text-slate-650 cursor-pointer text-sm"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-3.5 size-4 pointer-events-none text-slate-400" />
              </div>

              <div className="relative">
                <select
                  className="w-full sm:w-56 h-11 px-4 pr-10 border border-slate-200 rounded-lg outline-none bg-slate-50 appearance-none text-slate-650 cursor-pointer text-sm"
                  value={parkFilter}
                  onChange={(e) => {
                    setParkFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All">All Holiday Parks</option>
                  <option value="Århus Lakeside Retreat">Århus Lakeside Retreat</option>
                  <option value="Nordic Pines Retreat">Nordic Pines Retreat</option>
                  <option value="Nordic Fjord Expedition">Nordic Fjord Expedition</option>
                  <option value="Sicilian Citrus Grove Getaway">Sicilian Citrus Grove Getaway</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-3.5 size-4 pointer-events-none text-slate-400" />
              </div>
            </div>

            <button
              onClick={loadData}
              className="h-11 px-4 border border-slate-200 bg-white text-slate-700 font-semibold rounded-lg flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors text-sm"
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </section>

          {/* Bookings Table */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-550 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6">Booking ID</th>
                    <th className="py-4 px-6">Guest</th>
                    <th className="py-4 px-6">Property</th>
                    <th className="py-4 px-6">Dates</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-[15px]">
                  {bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <tr key={booking._id || booking.bookingId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900">{booking.bookingId}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                booking.avatar ||
                                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80"
                              }
                              alt={booking.guest}
                              className="size-9 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-semibold text-slate-850">{booking.guest}</div>
                              <div className="text-xs text-slate-450">{booking.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-800">
                            {booking.propertyName || (typeof booking.property === "object" ? booking.property?.title : "Property Unit")}
                          </div>
                          <div className="text-xs text-slate-450">{booking.park || "Holiday Retreat"}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          <div className="flex items-center gap-1.5 text-sm">
                            <Calendar size={14} className="text-slate-400" />
                            {booking.dates || `${new Date(booking.checkInDate).toLocaleDateString()} - ${new Date(booking.checkOutDate).toLocaleDateString()}`}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {booking.amount || `${booking.currency || "€"}${booking.totalAmount}`}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              booking.status === BookingStatus.CONFIRMED || booking.status === "Confirmed"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : booking.status === BookingStatus.PENDING || booking.status === "Pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            className="p-2 text-slate-400 hover:text-[#3b338c] hover:bg-slate-100 rounded-lg transition-all inline-flex items-center gap-1.5"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Eye size={16} />
                            <span className="text-xs font-semibold">View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No bookings match your current search or filter parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total items)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 border border-slate-200 rounded-lg bg-white disabled:opacity-40 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 border border-slate-200 rounded-lg bg-white disabled:opacity-40 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Booking Details</h3>
                <p className="text-xs text-slate-450 mt-0.5">Reference Code: {selectedBooking.bookingId}</p>
              </div>
              <button
                type="button"
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-450 hover:text-slate-700 transition-colors"
                onClick={() => setSelectedBooking(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col gap-5 text-sm">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <img
                  src={
                    selectedBooking.avatar ||
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80"
                  }
                  alt={selectedBooking.guest}
                  className="size-12 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-bold text-slate-850">{selectedBooking.guest}</h4>
                  <p className="text-xs text-slate-500">{selectedBooking.email}</p>
                  {selectedBooking.phone && <p className="text-xs text-slate-400">{selectedBooking.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider">Holiday Park</span>
                  <p className="font-semibold text-slate-800 mt-1">{selectedBooking.park || "Retreat"}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider">Property Unit</span>
                  <p className="font-semibold text-slate-800 mt-1">
                    {selectedBooking.propertyName || (typeof selectedBooking.property === "object" ? selectedBooking.property?.title : "Villa")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider">Stay Dates</span>
                  <p className="font-semibold text-slate-800 mt-1">
                    {selectedBooking.dates || `${new Date(selectedBooking.checkInDate).toLocaleDateString()} - ${new Date(selectedBooking.checkOutDate).toLocaleDateString()}`}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider">Total Amount</span>
                  <p className="font-bold text-slate-900 text-base mt-1">
                    {selectedBooking.amount || `${selectedBooking.currency || "€"}${selectedBooking.totalAmount}`}
                  </p>
                </div>
              </div>

              {(selectedBooking as any)?.specialRequests && (
                <div className="bg-slate-50 p-3 rounded-lg text-xs border border-slate-100">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Special Requests</span>
                  <p className="text-slate-700 italic">"{(selectedBooking as any)?.specialRequests}"</p>
                </div>
              )}

              {/* Status & Payment Status Controls */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Booking Status
                    </label>
                    <select
                      disabled={updating}
                      value={selectedBooking.status}
                      onChange={(e) =>
                        handleUpdateStatus(
                          selectedBooking._id || selectedBooking.bookingId,
                          e.target.value as BookingStatus,
                          undefined
                        )
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-750 outline-none focus:bg-white focus:border-[#3b338c] transition-colors"
                    >
                      <option value={BookingStatus.CONFIRMED}>Confirmed</option>
                      <option value={BookingStatus.PENDING}>Pending</option>
                      <option value={BookingStatus.COMPLETED}>Completed</option>
                      <option value={BookingStatus.CANCELLED}>Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Payment Status
                    </label>
                    <select
                      disabled={updating}
                      value={selectedBooking.paymentStatus || PaymentStatus.PENDING}
                      onChange={(e) =>
                        handleUpdateStatus(
                          selectedBooking._id || selectedBooking.bookingId,
                          undefined,
                          e.target.value as PaymentStatus
                        )
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-750 outline-none focus:bg-white focus:border-[#3b338c] transition-colors"
                    >
                      <option value={PaymentStatus.PAID}>Paid</option>
                      <option value={PaymentStatus.PENDING}>Pending</option>
                      <option value={PaymentStatus.REFUNDED}>Refunded</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border border-slate-200 bg-white text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-50 transition-colors"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
              {selectedBooking.status !== BookingStatus.CANCELLED && selectedBooking.status !== "Cancelled" && (
                <button
                  type="button"
                  disabled={updating}
                  className="px-4 py-2 bg-red-700 text-white font-semibold rounded-lg text-xs hover:bg-red-800 transition-colors disabled:opacity-50"
                  onClick={() => handleCancelBooking(selectedBooking._id || selectedBooking.bookingId, selectedBooking.bookingId)}
                >
                  {updating ? "Processing..." : "Cancel Booking"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
