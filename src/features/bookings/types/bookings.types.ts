export enum BookingStatus {
  CONFIRMED = 'Confirmed',
  PENDING = 'Pending',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed',
}

export enum PaymentStatus {
  PAID = 'Paid',
  PENDING = 'Pending',
  REFUNDED = 'Refunded',
}

export interface AdminBooking {
  _id: string;
  bookingId: string;
  user?: string | null;
  guest: string;
  email: string;
  phone?: string;
  avatar?: string;
  holidayPark?: any;
  park?: string;
  property?: any;
  propertyName?: string;
  checkInDate: string;
  checkOutDate: string;
  dates?: string;
  nights?: number;
  guestsCount?: number;
  amount?: string;
  totalAmount?: number;
  currency?: string;
  status: BookingStatus | string;
  paymentStatus?: PaymentStatus | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryBookingDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  park?: string;
  paymentStatus?: string;
}

export interface UpdateBookingStatusDto {
  status: BookingStatus | string;
  paymentStatus?: PaymentStatus | string;
}

export interface BookingMetrics {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  activeGuests: number;
}

export interface BookingsListResponse {
  items: AdminBooking[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
