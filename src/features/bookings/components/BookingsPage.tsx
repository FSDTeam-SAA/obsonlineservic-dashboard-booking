"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Download,
  Trash2,
  Loader2,
  CheckCircle,
  Plus,
  Copy,
  MapPin,
  CreditCard,
  Building,
  User,
  Mail,
  Phone,
  FileText,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import {
  fetchAdminBookings,
  updateBookingStatus,
  cancelAdminBooking,
  deleteAdminBooking,
  fetchDashboardOverview,
  fetchHolidayParks,
  fetchAdminProperties,
  createAdminBooking,
} from "../api/bookings.api";
import {
  AdminBooking,
  BookingStatus,
  PaymentStatus,
  CreateBookingDto,
} from "../types/bookings.types";
import { BookingsSkeleton } from "./BookingsSkeleton";

export function BookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Dynamic Options (Real Data)
  const [holidayParksList, setHolidayParksList] = useState<{ id: string; title: string }[]>([]);
  const [propertiesList, setPropertiesList] = useState<{ id: string; title: string; pricePerNight?: number; holidayParkId?: string }[]>([]);

  // Pagination & Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
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

  // Create New Booking Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateBookingDto>({
    guest: "",
    email: "",
    phone: "",
    property: "",
    holidayPark: "",
    checkInDate: "",
    checkOutDate: "",
    guestsCount: 2,
    specialRequests: "",
  });
  const [creating, setCreating] = useState(false);

  // Confirmation dialog state
  const [pendingCancel, setPendingCancel] = useState<AdminBooking | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminBooking | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load Real Data
  const loadData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else if (bookings.length === 0) setLoading(true);
      setError(null);

      const [bookingsRes, overviewRes, parksRes] = await Promise.allSettled([
        fetchAdminBookings({
          page,
          limit: 10,
          search: searchTerm.trim() || undefined,
          status: statusFilter !== "All" ? statusFilter : undefined,
          paymentStatus: paymentFilter !== "All" ? paymentFilter : undefined,
          park: parkFilter !== "All" ? parkFilter : undefined,
        }),
        fetchDashboardOverview(),
        fetchHolidayParks({ limit: 50 }),
      ]);

      // Bookings List
      if (bookingsRes.status === "fulfilled" && bookingsRes.value) {
        const data = bookingsRes.value;
        setBookings(data.items || []);
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1);
          setTotalCount(data.meta.total || 0);
        }
      }

      // Overview Stats
      if (overviewRes.status === "fulfilled" && overviewRes.value) {
        const ov = overviewRes.value;
        const summary = ov.bookingsSummary || {};
        setStats({
          totalBookings: summary.totalBookings || 0,
          pendingBookings: summary.pendingBookings || 0,
          totalRevenue: typeof summary.totalRevenue === 'string'
            ? parseFloat(summary.totalRevenue.replace(/[^0-9.]/g, '')) || 0
            : (summary.totalRevenue || 0),
          activeGuests: summary.activeGuests || 0,
        });
      }

      // Real Holiday Parks for filter
      if (parksRes.status === "fulfilled" && parksRes.value) {
        const parks = parksRes.value.items || [];
        setHolidayParksList(
          parks.map((p: any) => ({
            id: p._id || p.id,
            title: p.name || p.title || "Holiday Park",
          }))
        );
      }
    } catch (err: any) {
      console.error("Failed to fetch admin bookings:", err);
      setError("Could not load bookings list. Please verify your admin session.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, statusFilter, paymentFilter, parkFilter]);

  // Debounced Search Handler
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load Real Properties when opening Create Modal
  const handleOpenCreateModal = async () => {
    setIsCreateModalOpen(true);
    try {
      const res = await fetchAdminProperties({ limit: 100 });
      const props = res.items || [];
      setPropertiesList(
        props.map((p) => ({
          id: p._id,
          title: p.title,
          pricePerNight: p.pricePerNight,
          holidayParkId: typeof p.holidayPark === "object" ? (p.holidayPark as any)?._id : p.holidayPark,
        }))
      );
      if (props.length > 0 && !createForm.property) {
        setCreateForm((prev) => ({
          ...prev,
          property: props[0]._id,
          propertyName: props[0].title,
        }));
      }
    } catch (err) {
      console.error("Failed to load properties for creation:", err);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.guest || !createForm.email || !createForm.property || !createForm.checkInDate || !createForm.checkOutDate) {
      setError("Please fill out all required fields.");
      return;
    }
    try {
      setCreating(true);
      const selectedProp = propertiesList.find((p) => p.id === createForm.property);
      const newBooking = await createAdminBooking({
        ...createForm,
        propertyName: selectedProp?.title || createForm.propertyName,
        holidayPark: selectedProp?.holidayParkId || createForm.holidayPark,
      });

      setToastMessage(`Booking ${newBooking.bookingId || "reservation"} successfully created!`);
      setIsCreateModalOpen(false);
      setCreateForm({
        guest: "",
        email: "",
        phone: "",
        property: "",
        holidayPark: "",
        checkInDate: "",
        checkOutDate: "",
        guestsCount: 2,
        specialRequests: "",
      });
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create booking.");
    } finally {
      setCreating(false);
    }
  };

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

      setToastMessage(`Updated status for reservation ${updated?.bookingId || id}.`);

      if (selectedBooking && (selectedBooking._id === id || selectedBooking.bookingId === id)) {
        setSelectedBooking(updated);
      }

      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update booking status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!pendingCancel) return;
    const targetId = pendingCancel._id || pendingCancel.bookingId;
    try {
      setUpdating(true);
      await cancelAdminBooking(targetId);
      setToastMessage(`Booking ${pendingCancel.bookingId} marked as Cancelled.`);
      setPendingCancel(null);
      setSelectedBooking(null);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const targetId = pendingDelete._id || pendingDelete.bookingId;
    try {
      setDeletingId(targetId);
      await deleteAdminBooking(targetId);
      setToastMessage(`Booking ${pendingDelete.bookingId} permanently deleted.`);
      setPendingDelete(null);
      setSelectedBooking(null);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete booking.");
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) return;

    const headers = [
      "Booking Code",
      "Guest Name",
      "Guest Email",
      "Phone",
      "Property",
      "Holiday Park",
      "Check In",
      "Check Out",
      "Amount",
      "Status",
      "Payment Status",
    ];
    const rows = bookings.map((b) => [
      `"${b.bookingId}"`,
      `"${b.guest}"`,
      `"${b.email}"`,
      `"${b.phone || ""}"`,
      `"${b.propertyName || (typeof b.property === "object" && b.property !== null ? b.property.title : "Property")}"`,
      `"${b.park || (typeof b.holidayPark === "object" && b.holidayPark !== null ? b.holidayPark.name : "Retreat")}"`,
      `"${b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : ""}"`,
      `"${b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : ""}"`,
      `"${b.amount || "€" + (b.totalAmount || 0)}"`,
      `"${b.status}"`,
      `"${b.paymentStatus || "Pending"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e: string[]) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OBS_Bookings_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 ring-1 ring-emerald-500/20">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Confirmed
          </span>
        );
      case BookingStatus.PENDING:
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20 ring-1 ring-amber-500/20">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case BookingStatus.COMPLETED:
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-700 border border-sky-500/20 ring-1 ring-sky-500/20">
            <span className="size-1.5 rounded-full bg-sky-500" />
            Completed
          </span>
        );
      case BookingStatus.CANCELLED:
      case "Cancelled":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 border border-rose-500/20 ring-1 ring-rose-500/20">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Cancelled
          </span>
        );
    }
  };

  const getPaymentBadge = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case PaymentStatus.PAID:
      case "Paid":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Paid
          </span>
        );
      case PaymentStatus.REFUNDED:
      case "Refunded":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            Refunded
          </span>
        );
      case PaymentStatus.PENDING:
      case "Pending":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Unpaid
          </span>
        );
    }
  };

  return (
    <DashboardShell
      active="Bookings"
      title="Bookings Management"
      subtitle="Monitor real-time guest reservations, manage check-in statuses, and track revenue."
    >
      {loading && bookings.length === 0 ? (
        <BookingsSkeleton />
      ) : (
        <main className="grid gap-6 p-5 md:p-8 font-sans max-w-7xl mx-auto w-full">
          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl p-4 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle className="size-4" />
                  </div>
                  <span className="font-semibold text-sm">{toastMessage}</span>
                </div>
                <button
                  onClick={() => setToastMessage(null)}
                  className="text-emerald-600 hover:text-emerald-950 p-1.5 rounded-lg hover:bg-emerald-100/50 cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Notification */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={20} className="shrink-0 text-rose-600" />
                <span className="font-medium">{error}</span>
              </div>
              <button
                onClick={() => loadData(true)}
                className="px-3.5 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition-colors cursor-pointer shadow-xs"
              >
                Retry
              </button>
            </div>
          )}

          {/* Metric Cards Row */}
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <motion.div
              whileHover={{ y: -2 }}
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</span>
                <span className="grid size-11 place-items-center rounded-xl bg-violet-50 text-[#3b338c] border border-violet-100">
                  <TicketCheck size={20} />
                </span>
              </div>
              <strong className="mt-3 block text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalCount || stats.totalBookings}
              </strong>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <Sparkles className="size-3.5" />
                <span>Live Reservation Record</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending</span>
                <span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <Clock size={20} />
                </span>
              </div>
              <strong className="mt-3 block text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.pendingBookings}
              </strong>
              <div className="mt-2 text-xs text-amber-600 font-medium">Requires Admin Confirmation</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
                <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Coins size={20} />
                </span>
              </div>
              <strong className="mt-3 block text-3xl font-extrabold text-slate-900 tracking-tight">
                €{stats.totalRevenue.toLocaleString()}
              </strong>
              <div className="mt-2 text-xs text-emerald-600 font-semibold">Total earnings from bookings</div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Guests</span>
                <span className="grid size-11 place-items-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                  <Users size={20} />
                </span>
              </div>
              <strong className="mt-3 block text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.activeGuests}
              </strong>
              <div className="mt-2 text-xs text-slate-500 font-medium">Currently Checked-in</div>
            </motion.div>
          </section>

          {/* Filter & Action Controls Section */}
          <section className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
            <div className="flex flex-1 flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search guest name, email, booking code..."
                  className="w-full h-11 pl-10 pr-9 border border-slate-200 rounded-xl outline-none text-slate-800 bg-slate-50/70 focus:bg-white focus:border-[#3b338c] focus:ring-2 focus:ring-[#3b338c]/10 transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="relative w-full sm:w-40">
                <select
                  className="w-full h-11 px-3.5 pr-9 border border-slate-200 rounded-xl outline-none bg-slate-50/70 focus:bg-white focus:border-[#3b338c] appearance-none text-slate-700 cursor-pointer text-xs font-semibold"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-3.5 size-4 pointer-events-none text-slate-400" />
              </div>

              {/* Payment Filter */}
              <div className="relative w-full sm:w-40">
                <select
                  className="w-full h-11 px-3.5 pr-9 border border-slate-200 rounded-xl outline-none bg-slate-50/70 focus:bg-white focus:border-[#3b338c] appearance-none text-slate-700 cursor-pointer text-xs font-semibold"
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All">All Payments</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Unpaid / Pending</option>
                  <option value="Refunded">Refunded</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-3.5 size-4 pointer-events-none text-slate-400" />
              </div>

              {/* Holiday Park Filter (Dynamic Real Data) */}
              <div className="relative w-full sm:w-48">
                <select
                  className="w-full h-11 px-3.5 pr-9 border border-slate-200 rounded-xl outline-none bg-slate-50/70 focus:bg-white focus:border-[#3b338c] appearance-none text-slate-700 cursor-pointer text-xs font-semibold truncate"
                  value={parkFilter}
                  onChange={(e) => {
                    setParkFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All">All Holiday Parks</option>
                  {holidayParksList.map((park) => (
                    <option key={park.id} value={park.title}>
                      {park.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-3.5 size-4 pointer-events-none text-slate-400" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 self-end lg:self-auto">
              <button
                onClick={handleOpenCreateModal}
                className="h-11 px-4 bg-gradient-to-r from-[#3b338c] to-[#4c43ad] hover:from-[#322a78] hover:to-[#3e3694] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer text-xs"
              >
                <Plus size={16} /> New Booking
              </button>

              <button
                onClick={handleExportCSV}
                className="h-11 px-3.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors text-xs cursor-pointer"
                title="Export Bookings to CSV"
              >
                <Download size={15} /> Export
              </button>

              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="h-11 px-3.5 border border-slate-200 bg-white text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors text-xs cursor-pointer disabled:opacity-60"
              >
                <RefreshCw size={15} className={refreshing ? "animate-spin text-[#3b338c]" : ""} />
              </button>
            </div>
          </section>

          {/* Bookings Modern Table */}
          <section className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Booking Code</th>
                    <th className="py-4 px-6">Guest Info</th>
                    <th className="py-4 px-6">Property / Retreat</th>
                    <th className="py-4 px-6">Stay Dates</th>
                    <th className="py-4 px-6">Total Amount</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                  {bookings.length > 0 ? (
                    bookings.map((booking) => {
                      const propTitle =
                        booking.propertyName ||
                        (typeof booking.property === "object" && booking.property !== null
                          ? booking.property.title
                          : "Property Villa");
                      const parkName =
                        booking.park ||
                        (typeof booking.holidayPark === "object" && booking.holidayPark !== null
                          ? booking.holidayPark.name || booking.holidayPark.title
                          : "Holiday Retreat");

                      return (
                        <tr
                          key={booking._id || booking.bookingId}
                          className="hover:bg-slate-50/70 transition-colors group"
                        >
                          {/* Booking Code */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-1 rounded-md border border-slate-200/60">
                                {booking.bookingId}
                              </span>
                              <button
                                onClick={() => copyToClipboard(booking.bookingId)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 transition-opacity cursor-pointer"
                                title="Copy Booking ID"
                              >
                                {copiedCode === booking.bookingId ? (
                                  <CheckCircle size={13} className="text-emerald-600" />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Guest Info */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {booking.avatar ? (
                                <img
                                  src={booking.avatar}
                                  alt={booking.guest}
                                  className="size-9 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="size-9 rounded-full bg-gradient-to-tr from-[#3b338c] to-violet-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                  {booking.guest.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-slate-900">{booking.guest}</div>
                                <div className="text-xs text-slate-400 font-normal">{booking.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Property & Retreat */}
                          <td className="py-4 px-6 max-w-xs">
                            <div className="font-semibold text-slate-800 truncate">{propTitle}</div>
                            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                              <MapPin size={12} className="shrink-0 text-slate-400" />
                              <span className="truncate">{parkName}</span>
                            </div>
                          </td>

                          {/* Dates & Nights */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                              <Calendar size={13} className="text-slate-400 shrink-0" />
                              <span>
                                {booking.dates ||
                                  `${new Date(booking.checkInDate).toLocaleDateString()} - ${new Date(
                                    booking.checkOutDate
                                  ).toLocaleDateString()}`}
                              </span>
                            </div>
                            {booking.nights && (
                              <span className="inline-block mt-1 text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                                {booking.nights} nights
                              </span>
                            )}
                          </td>

                          {/* Amount & Payment */}
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900">
                              {booking.amount || `${booking.currency || "€"}${booking.totalAmount || 0}`}
                            </div>
                            <div className="mt-0.5">{getPaymentBadge(booking.paymentStatus as string)}</div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">{getStatusBadge(booking.status as string)}</td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                className="px-2.5 py-1.5 text-slate-600 hover:text-[#3b338c] bg-slate-100/80 hover:bg-slate-200/70 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
                                onClick={() => setSelectedBooking(booking)}
                                title="View & Edit Booking Details"
                              >
                                <Eye size={14} />
                                <span>Details</span>
                              </button>
                              <button
                                type="button"
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                                onClick={() => setPendingDelete(booking)}
                                title="Delete Booking Record"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400">
                        <div className="max-w-xs mx-auto space-y-2">
                          <TicketCheck className="size-10 mx-auto text-slate-300" />
                          <p className="font-semibold text-slate-600 text-sm">No reservations found</p>
                          <p className="text-xs text-slate-400">
                            Try broadening your search term or clearing active filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium">
                  Showing Page <strong className="text-slate-900">{page}</strong> of{" "}
                  <strong className="text-slate-900">{totalPages}</strong> ({totalCount} total items)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 border border-slate-200 rounded-xl bg-white disabled:opacity-40 hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 border border-slate-200 rounded-xl bg-white disabled:opacity-40 hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      {/* Booking Details & Status Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-8"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-gradient-to-tr from-[#3b338c] to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {selectedBooking.guest.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>Reservation Details</span>
                      {getStatusBadge(selectedBooking.status as string)}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>Code: {selectedBooking.bookingId}</span>
                      <button
                        onClick={() => copyToClipboard(selectedBooking.bookingId)}
                        className="hover:text-slate-700 cursor-pointer"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="p-2 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  onClick={() => setSelectedBooking(null)}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 text-sm max-h-[70vh] overflow-y-auto">
                {/* Guest Profile Section */}
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} /> Guest Information
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Name:</span>
                      <p className="font-semibold text-slate-900">{selectedBooking.guest}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Email:</span>
                      <p className="font-semibold text-slate-900">{selectedBooking.email}</p>
                    </div>
                    {selectedBooking.phone && (
                      <div>
                        <span className="text-slate-400 font-medium">Phone:</span>
                        <p className="font-semibold text-slate-900">{selectedBooking.phone}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400 font-medium">Guests Count:</span>
                      <p className="font-semibold text-slate-900">{selectedBooking.guestsCount || 2} Guests</p>
                    </div>
                  </div>
                </div>

                {/* Stay & Property Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl border border-slate-100 bg-white space-y-1">
                    <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building size={13} /> Property Unit
                    </span>
                    <p className="font-bold text-slate-900 text-sm mt-1">
                      {selectedBooking.propertyName ||
                        (typeof selectedBooking.property === "object" ? selectedBooking.property?.title : "Villa")}
                    </p>
                    <p className="text-slate-500 font-medium">{selectedBooking.park || "Holiday Retreat"}</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-100 bg-white space-y-1">
                    <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar size={13} /> Stay Schedule
                    </span>
                    <p className="font-semibold text-slate-900 mt-1">
                      {selectedBooking.dates ||
                        `${new Date(selectedBooking.checkInDate).toLocaleDateString()} - ${new Date(
                          selectedBooking.checkOutDate
                        ).toLocaleDateString()}`}
                    </p>
                    {selectedBooking.nights && (
                      <p className="text-slate-500 font-medium">{selectedBooking.nights} Nights Duration</p>
                    )}
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <div className="bg-amber-50/60 p-3.5 rounded-2xl text-xs border border-amber-100/80">
                    <span className="font-bold text-amber-800 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                      <FileText size={13} /> Special Requests
                    </span>
                    <p className="text-amber-950 font-medium italic">"{selectedBooking.specialRequests}"</p>
                  </div>
                )}

                {/* Financial Breakdown */}
                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard size={13} /> Payment & Financials
                  </span>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">Total Charged Amount</span>
                    <span className="font-extrabold text-slate-900 text-base">
                      {selectedBooking.amount || `${selectedBooking.currency || "€"}${selectedBooking.totalAmount}`}
                    </span>
                  </div>
                  {selectedBooking.offerCode && (
                    <div className="flex items-center justify-between text-xs text-emerald-700">
                      <span>Applied Promo Code</span>
                      <span className="font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded">
                        {selectedBooking.offerCode}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Update Controls */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-900 block">Manage Statuses</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
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
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3b338c] transition-colors cursor-pointer"
                      >
                        <option value={BookingStatus.CONFIRMED}>Confirmed</option>
                        <option value={BookingStatus.PENDING}>Pending</option>
                        <option value={BookingStatus.COMPLETED}>Completed</option>
                        <option value={BookingStatus.CANCELLED}>Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
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
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#3b338c] transition-colors cursor-pointer"
                      >
                        <option value={PaymentStatus.PAID}>Paid</option>
                        <option value={PaymentStatus.PENDING}>Pending / Unpaid</option>
                        <option value={PaymentStatus.REFUNDED}>Refunded</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="px-3.5 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  onClick={() => setPendingDelete(selectedBooking)}
                >
                  <Trash2 size={14} /> Delete Record
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    className="px-4 py-2.5 border border-slate-200 bg-white text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
                    onClick={() => setSelectedBooking(null)}
                  >
                    Close
                  </button>
                  {selectedBooking.status !== BookingStatus.CANCELLED && selectedBooking.status !== "Cancelled" && (
                    <button
                      type="button"
                      disabled={updating}
                      className="px-4 py-2.5 bg-rose-600 text-white font-semibold rounded-xl text-xs hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                      onClick={() => setPendingCancel(selectedBooking)}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create New Reservation Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-8"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-gradient-to-r from-[#3b338c] to-violet-600 text-white flex items-center justify-center">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Create New Reservation</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Manually record a guest reservation</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-2 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="p-6 space-y-4 text-sm max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Guest Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Clara Oswald"
                      className="w-full h-10 px-3.5 border border-slate-200 rounded-xl outline-none text-xs text-slate-800 bg-slate-50/70 focus:bg-white focus:border-[#3b338c] transition-all"
                      value={createForm.guest}
                      onChange={(e) => setCreateForm({ ...createForm, guest: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Guest Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="clara@example.com"
                      className="w-full h-10 px-3.5 border border-slate-200 rounded-xl outline-none text-xs text-slate-800 bg-slate-50/70 focus:bg-white focus:border-[#3b338c] transition-all"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+44 7123 456789"
                      className="w-full h-10 px-3.5 border border-slate-200 rounded-xl outline-none text-xs text-slate-800 bg-slate-50/70 focus:bg-white focus:border-[#3b338c] transition-all"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Guests Count</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      className="w-full h-10 px-3.5 border border-slate-200 rounded-xl outline-none text-xs text-slate-800 bg-slate-50/70 focus:bg-white focus:border-[#3b338c] transition-all"
                      value={createForm.guestsCount}
                      onChange={(e) => setCreateForm({ ...createForm, guestsCount: parseInt(e.target.value, 10) || 1 })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Select Property Unit *</label>
                  <select
                    required
                    className="w-full h-10 px-3.5 border border-slate-200 rounded-xl outline-none text-xs text-slate-800 bg-slate-50/70 focus:bg-white focus:border-[#3b338c] transition-all cursor-pointer font-medium"
                    value={createForm.property}
                    onChange={(e) => setCreateForm({ ...createForm, property: e.target.value })}
                  >
                    <option value="" disabled>
                      -- Choose a property --
                    </option>
                    {propertiesList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} {p.pricePerNight ? `(€${p.pricePerNight}/night)` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Check-in Date *</label>
                    <input
                      type="date"
                      required
                      className="w-full h-10 px-3.5 border border-slate-200 rounded-xl outline-none text-xs text-slate-800 bg-slate-50/70 focus:bg-white focus:border-[#3b338c] transition-all cursor-pointer"
                      value={typeof createForm.checkInDate === "string" ? createForm.checkInDate : ""}
                      onChange={(e) => setCreateForm({ ...createForm, checkInDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Check-out Date *</label>
                    <input
                      type="date"
                      required
                      className="w-full h-10 px-3.5 border border-slate-200 rounded-xl outline-none text-xs text-slate-800 bg-slate-50/70 focus:bg-white focus:border-[#3b338c] transition-all cursor-pointer"
                      value={typeof createForm.checkOutDate === "string" ? createForm.checkOutDate : ""}
                      onChange={(e) => setCreateForm({ ...createForm, checkOutDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Special Requests</label>
                  <textarea
                    rows={3}
                    placeholder="Late arrival, extra towels, crib..."
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none text-xs text-slate-800 bg-slate-50/70 focus:bg-white focus:border-[#3b338c] transition-all"
                    value={createForm.specialRequests}
                    onChange={(e) => setCreateForm({ ...createForm, specialRequests: e.target.value })}
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    className="px-4 py-2.5 border border-slate-200 bg-white text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2.5 bg-[#3b338c] text-white font-semibold rounded-xl text-xs hover:bg-[#322a78] transition-colors disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    {creating ? <Loader2 className="size-4 animate-spin" /> : "Confirm Reservation"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Dialog */}
      <AnimatePresence>
        {pendingCancel && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-center"
            >
              <div className="size-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-100">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Cancel Reservation?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to mark reservation <strong className="text-slate-900">{pendingCancel.bookingId}</strong> for {pendingCancel.guest} as Cancelled?
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingCancel(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Keep Active
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleConfirmCancel}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {updating ? <Loader2 className="size-4 animate-spin" /> : "Cancel Booking"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {pendingDelete && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-center"
            >
              <div className="size-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-100">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Delete Permanently?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to permanently delete reservation <strong className="text-slate-900">{pendingDelete.bookingId}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={deletingId === (pendingDelete._id || pendingDelete.bookingId)}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {deletingId === (pendingDelete._id || pendingDelete.bookingId) ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    "Delete Record"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
