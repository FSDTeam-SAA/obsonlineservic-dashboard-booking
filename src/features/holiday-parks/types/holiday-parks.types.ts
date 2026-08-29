export interface HolidayParkLocation {
  country?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  streetAddress?: string;
}

export interface HolidayPark {
  _id: string;
  name: string;
  title: string;
  badgeLocation?: string;
  shortDescription?: string;
  fullDescription?: string;
  startingPrice: number;
  totalCapacity?: string;
  totalProperties?: number;
  availableProperties?: number;
  checkInTime?: string;
  checkOutTime?: string;
  receptionHours?: string;
  amenities?: string[];
  location?: HolidayParkLocation;
  coverImage?: string;
  isFeatured?: boolean;
  status: "Active" | "Inactive" | "Draft" | "Archived" | "Maintenance";
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHolidayParkDto {
  name: string;
  title: string;
  badgeLocation?: string;
  shortDescription?: string;
  fullDescription?: string;
  startingPrice?: number;
  totalCapacity?: string;
  totalProperties?: number;
  availableProperties?: number;
  checkInTime?: string;
  checkOutTime?: string;
  receptionHours?: string;
  amenities?: string[];
  location?: HolidayParkLocation;
  coverImage?: string;
  isFeatured?: boolean;
  status?: "Active" | "Inactive" | "Draft" | "Archived" | "Maintenance";
}

export interface UpdateHolidayParkDto extends Partial<CreateHolidayParkDto> {
  rating?: number;
}

export interface QueryHolidayParkDto {
  search?: string;
  country?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedHolidayParksResponse {
  items: HolidayPark[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
  data?: {
    items: HolidayPark[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
