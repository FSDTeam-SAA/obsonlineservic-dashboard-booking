export interface ReviewPropertyRef {
  _id: string;
  title: string;
  category?: string;
  location?: string;
}

export interface Review {
  _id: string;
  property: string | ReviewPropertyRef;
  name: string;
  country: string;
  rating: number;
  comment: string;
  isApproved?: boolean;
  isPublished?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface QueryReviewDto {
  property?: string;
  page?: number;
  limit?: number;
  rating?: number;
  search?: string;
}

export interface PaginatedReviewsResponse {
  items: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
  data?: {
    items: Review[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
