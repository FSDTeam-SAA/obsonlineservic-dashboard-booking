export interface LocationDetails {
  country: string;
  city?: string;
  region?: string;
  postalCode?: string;
  formattedAddress?: string;
  mapLocationPreview?: string;
  latitude?: number;
  longitude?: number;
}

export interface CustomAmenity {
  title: string;
  description?: string;
  iconName?: string;
}

export type CustomAmenityDto = CustomAmenity;

export interface EcoBadge {
  tagline?: string;
  title?: string;
}

export type ParkStatus = 'Active' | 'Inactive' | 'Maintenance' | 'Draft';
export type ParkStatusType = ParkStatus;

export interface HolidayPark {
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
  featuredAmenities?: CustomAmenity[];
  startingPrice?: number;
  currency?: string;
  totalProperties?: number;
  availableProperties?: number;
  totalCapacity?: string;
  checkInTime?: string;
  checkOutTime?: string;
  receptionHours?: string;
  location?: LocationDetails;
  ecoBadge?: EcoBadge;
  status: ParkStatus;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHolidayParkDto {
  name: string;
  title: string;
  badgeLocation?: string;
  subtitle?: string;
  shortDescription?: string;
  fullDescription?: string;
  paragraphs?: string[];
  startingPrice?: number;
  currency?: string;
  totalCapacity?: string;
  totalProperties?: number;
  availableProperties?: number;
  checkInTime?: string;
  checkOutTime?: string;
  receptionHours?: string;
  rating?: number;
  reviewsCount?: number;
  amenities?: string[];
  featuredAmenities?: CustomAmenity[];
  ecoBadge?: EcoBadge;
  location?: LocationDetails;
  coverImage?: string;
  heroBanner?: string;
  gallery?: string[];
  isFeatured?: boolean;
  status?: ParkStatus;
}

export type CreateHolidayParkPayload = CreateHolidayParkDto;

export interface UpdateHolidayParkDto extends Partial<CreateHolidayParkDto> {}

export interface QueryHolidayParkDto {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  status?: string;
  isFeatured?: boolean;
}

export interface PaginatedHolidayParksResponse {
  items: HolidayPark[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
