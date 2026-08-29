export interface DashboardStatItem {
  title: string;
  value: number | string;
  note: string;
  key: string;
}

export interface BookingsSummary {
  totalBookings: number;
  totalBookingsGrowth: string;
  pendingBookings: number;
  pendingNote: string;
  totalRevenue: string;
  revenueGrowth: string;
  activeGuests: number;
  activeGuestsNote: string;
}

export interface PerformanceOverview {
  bookingRevenue: string;
  growthPercentage: string;
  monthlyChartData: number[];
}

export interface DashboardActiveOffer {
  id: string;
  title: string;
  discount: string;
  date: string;
  status: string;
}

export interface DashboardOverviewData {
  stats: DashboardStatItem[];
  bookingsSummary: BookingsSummary;
  performanceOverview: PerformanceOverview;
  activeOffers: DashboardActiveOffer[];
}
