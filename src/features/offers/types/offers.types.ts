export type OfferType = 'percentage' | 'fixed';

export type OfferScope = 'entire_platform' | 'holiday_parks' | 'properties';

export type OfferStatus = 'Active' | 'Expired' | 'Draft' | 'Inactive';

export interface Offer {
  _id: string;
  offerName: string;
  offerCode?: string;
  offerType: OfferType;
  discountValue: string;
  discountPercentage?: number;
  fixedDiscount?: number;
  description?: string;
  minBookingAmount?: number;
  maxDiscount?: number;
  maxUses?: number;
  maxUsesPerGuest?: number;
  usedCount?: number;
  scope: OfferScope;
  applicableParks?: any[];
  applicableProperties?: any[];
  applicableParkNames?: string[];
  validFrom: string;
  validUntil: string;
  status: OfferStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOfferDto {
  offerName: string;
  offerCode?: string;
  offerType?: OfferType;
  discountValue: string;
  discountPercentage?: number;
  fixedDiscount?: number;
  description?: string;
  minBookingAmount?: number;
  maxDiscount?: number;
  maxUses?: number;
  maxUsesPerGuest?: number;
  scope?: OfferScope;
  applicableParks?: string[];
  applicableProperties?: string[];
  applicableParkNames?: string[];
  validFrom?: string;
  validUntil?: string;
  status?: OfferStatus;
}

export interface UpdateOfferDto extends Partial<CreateOfferDto> {}

export interface QueryOfferDto {
  page?: number;
  limit?: number;
  search?: string;
  offerType?: OfferType;
  scope?: OfferScope;
  status?: string;
}

export interface PaginatedOffersResponse {
  items: Offer[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
