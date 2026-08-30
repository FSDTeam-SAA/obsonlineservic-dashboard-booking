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
  holidayPark?: {
    _id?: string;
    name?: string;
    title?: string;
    badgeLocation?: string;
    [key: string]: any;
  } | string | null;
  park?: string;
  property?: {
    _id?: string;
    title?: string;
    gallery?: string[];
    category?: string;
    pricePerNight?: number;
    cleaningFee?: number;
    taxes?: number;
    [key: string]: any;
  } | string | null;
  propertyName?: string;
  checkInDate: string;
  checkOutDate: string;
  dates?: string;
  nights?: number;
  guestsCount?: number;
  pricePerNight?: number;
  cleaningFee?: number;
  taxes?: number;
  discount?: number;
  offerCode?: string;
  amount?: string;
  totalAmount?: number;
  currency?: string;
  status: BookingStatus | string;
  paymentStatus?: PaymentStatus | string;
  specialRequests?: string;
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

export interface CreateBookingDto {
  guest: string;
  email: string;
  phone?: string;
  avatar?: string;
  holidayPark?: string;
  park?: string;
  property: string;
  propertyName?: string;
  checkInDate: string | Date;
  checkOutDate: string | Date;
  guestsCount?: number;
  offerCode?: string;
  currency?: string;
  specialRequests?: string;
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

