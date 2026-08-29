export type PropertyCategory =
  | 'All Properties'
  | 'Lakefront'
  | 'Cabins & Lodges'
  | 'Wellness Villas';

export type PropertyStatus = 'Active' | 'Draft' | 'Archived';

export interface PropertyGallery {
  main: string;
  side1?: string;
  side2?: string;
  side3?: string;
  photos?: string[];
  totalPhotos?: number;
}

export interface PropertyAmenity {
  name: string;
  iconName?: string;
}

export interface PropertySpec {
  label: string;
  value: string;
  iconName?: string;
}

export interface HolidayParkRef {
  _id: string;
  title?: string;
  name?: string;
  badgeLocation?: string;
}

export interface Property {
  _id: string;
  title: string;
  badge: string;
  category: PropertyCategory;
  holidayPark?: HolidayParkRef | string;
  holidayParkName?: string;
  location: string;
  country: string;
  rating: number;
  reviewsCount: number;
  description: string;
  pricePerNight: number;
  currency: string;
  priceSubtext: string;
  guests: number;
  beds: number;
  baths: number;
  size: string;
  parking: string;
  wifi: string;
  petsAllowed: boolean;
  cleaningFee: number;
  taxes: number;
  guaranteeText: string;
  gallery: PropertyGallery;
  amenities: PropertyAmenity[];
  specs: PropertySpec[];
  status: PropertyStatus;
  isPopular: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  category?: PropertyCategory | string;
  holidayPark?: string;
  country?: string;
  guests?: number;
  beds?: number;
  minPrice?: number;
  maxPrice?: number;
  petsAllowed?: boolean;
  status?: PropertyStatus | string;
  isPopular?: boolean;
}

export interface PaginatedPropertiesResponse {
  items: Property[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PropertyStats {
  total: number;
  active: number;
  draft: number;
  archived: number;
}

export interface CreatePropertyDto {
  title: string;
  badge?: string;
  category?: PropertyCategory;
  holidayPark?: string;
  holidayParkName?: string;
  location?: string;
  country?: string;
  description?: string;
  pricePerNight: number;
  guests?: number;
  beds?: number;
  baths?: number;
  size?: string;
  petsAllowed?: boolean;
  cleaningFee?: number;
  taxes?: number;
  gallery: PropertyGallery;
  amenities?: PropertyAmenity[];
  specs?: PropertySpec[];
  status?: PropertyStatus;
  isPopular?: boolean;
}

export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {}
