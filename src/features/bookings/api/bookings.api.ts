import { api } from "@/lib/api";
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
  return response.data;
}

/**
 * Update Booking Status & Payment Status (Admin)
 */
export async function updateBookingStatus(
  id: string,
  dto: UpdateBookingStatusDto
): Promise<AdminBooking> {
  const response = await api.patch(`/bookings/${id}/status`, dto);
  return response.data;
}

/**
 * Cancel a Booking (Admin)
 */
export async function cancelAdminBooking(id: string): Promise<AdminBooking> {
  const response = await api.delete(`/bookings/${id}/cancel`);
  return response.data;
}

export { fetchDashboardOverview } from "@/features/dashboard/api/dashboard.api";

