export interface LocationDetailsPayload {
  country: string;
  city?: string;
  region?: string;
  postalCode?: string;
  formattedAddress?: string;
  mapLocationPreview?: string;
  latitude?: number;
  longitude?: number;
}

export interface CustomAmenityPayload {
  title: string;
  description?: string;
  iconName?: string;
}

export interface EcoBadgePayload {
  tagline?: string;
  title?: string;
}

export type ParkStatusType = 'Active' | 'Inactive' | 'Maintenance';

export interface HolidayParkItem {
  _id: string;
  name: string;
  title: string;
  badgeLocation?: string;
  subtitle?: string;
  shortDescription?: string;
  fullDescription?: string;
  paragraphs?: string[];
  rating?: number;
  reviewsCount?: number;
  heroBanner?: string;
  coverImage?: string;
  gallery?: string[];
  amenities?: string[];
  featuredAmenities?: CustomAmenityPayload[];
  startingPrice?: number;
  currency?: string;
  totalProperties?: number;
  availableProperties?: number;
  totalCapacity?: string;
  checkInTime?: string;
  checkOutTime?: string;
  receptionHours?: string;
  location?: LocationDetailsPayload;
  ecoBadge?: EcoBadgePayload;
  status: ParkStatusType;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHolidayParkPayload {
  name: string;
  title: string;
  badgeLocation?: string;
  subtitle?: string;
  shortDescription?: string;
  fullDescription?: string;
  paragraphs?: string[];
  rating?: number;
  reviewsCount?: number;
  heroBanner?: string;
  coverImage?: string;
  gallery?: string[];
  amenities?: string[];
  featuredAmenities?: CustomAmenityPayload[];
  startingPrice?: number;
  currency?: string;
  totalProperties?: number;
  availableProperties?: number;
  totalCapacity?: string;
  checkInTime?: string;
  checkOutTime?: string;
  receptionHours?: string;
  location?: LocationDetailsPayload;
  ecoBadge?: EcoBadgePayload;
  status?: ParkStatusType;
  isFeatured?: boolean;
}

export type UpdateHolidayParkPayload = Partial<CreateHolidayParkPayload>;

export interface QueryHolidayParkAdmin {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  status?: ParkStatusType;
  isFeatured?: boolean;
}

export interface AdminPaginatedHolidayParksResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    items: HolidayParkItem[];
    meta: {
      totalItems: number;
      itemPages: number;
      currentPage: number;
      itemsPerPage: number;
    };
  };
}

export interface SingleAdminHolidayParkResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: HolidayParkItem;
}
