import { api } from "@/lib/api";
import { unwrapData, unwrapPaginated } from "@/lib/api-unwrap";
import { PaginatedReviewsResponse, QueryReviewDto, Review } from "../types/reviews.types";

export async function fetchReviews(query?: QueryReviewDto): Promise<PaginatedReviewsResponse> {
  const response = await api.get("/reviews", {
    params: query,
  });
  const paginated = unwrapPaginated<Review>(response.data);
  return {
    items: paginated.items,
    meta: paginated.meta || { total: paginated.items.length, page: query?.page || 1, limit: query?.limit || 10, totalPages: 1 },
  };
}

export async function deleteReview(id: string): Promise<{ message: string }> {
  const response = await api.delete(`/reviews/${id}`);
  return unwrapData<{ message: string }>(response.data);
}
