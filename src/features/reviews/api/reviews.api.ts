import { api } from "@/lib/api";
import { PaginatedReviewsResponse, QueryReviewDto, Review } from "../types/reviews.types";

export async function fetchReviews(query?: QueryReviewDto): Promise<PaginatedReviewsResponse> {
  const response = await api.get<PaginatedReviewsResponse>("/reviews", {
    params: query,
  });
  return response.data;
}

export async function deleteReview(id: string): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/reviews/${id}`);
  return response.data;
}
