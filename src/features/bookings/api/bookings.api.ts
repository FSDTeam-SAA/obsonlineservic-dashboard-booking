import { api } from "@/lib/api";
import { unwrapData, unwrapPaginated } from "@/lib/api-unwrap";
import {
  AdminBooking,
  BookingMetrics,
  BookingsListResponse,
  QueryBookingDto,
  UpdateBookingStatusDto,
} from "../types/bookings.types";

/**
 * Fetch Paginated Admin Bookings List
 */
export async function fetchAdminBookings(
  query?: QueryBookingDto
): Promise<BookingsListResponse> {
  const response = await api.get("/bookings", { params: query });
  const paginated = unwrapPaginated<AdminBooking>(response.data);
  return {
    items: paginated.items,
    meta: paginated.meta || { total: paginated.items.length, page: query?.page || 1, limit: query?.limit || 10, totalPages: 1 },
  };
}

/**
 * Get Booking Details by ID or OBS Code
 */
export async function fetchBookingById(id: string): Promise<AdminBooking> {
  const response = await api.get(`/bookings/${id}`);
  return unwrapData<AdminBooking>(response.data);
}

/**
 * Get Current Logged-in User's Bookings
 */
export async function fetchMyBookings(): Promise<AdminBooking[]> {
  const response = await api.get("/bookings/my-bookings");
  return unwrapData<AdminBooking[]>(response.data) || [];
}

/**
 * Update Booking Status & Payment Status (Admin)
 */
export async function updateBookingStatus(
  id: string,
  dto: UpdateBookingStatusDto
): Promise<AdminBooking> {
  const response = await api.patch(`/bookings/${id}/status`, dto);
  return unwrapData<AdminBooking>(response.data);
}

/**
 * Cancel a Booking (Admin)
 */
export async function cancelAdminBooking(id: string): Promise<AdminBooking> {
  const response = await api.delete(`/bookings/${id}/cancel`);
  return unwrapData<AdminBooking>(response.data);
}

export { fetchDashboardOverview } from "@/features/dashboard/api/dashboard.api";
