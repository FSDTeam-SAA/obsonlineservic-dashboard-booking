import { api } from '@/lib/api';
import {
  Offer,
  CreateOfferDto,
  UpdateOfferDto,
  QueryOfferDto,
  PaginatedOffersResponse,
} from '../types/offers.types';

export async function fetchOffers(
  query?: QueryOfferDto
): Promise<PaginatedOffersResponse> {
  const response = await api.get<PaginatedOffersResponse>('/offers', {
    params: query,
  });
  return response.data;
}

export async function fetchOfferById(id: string): Promise<Offer> {
  const response = await api.get<Offer>(`/offers/${id}`);
  return response.data;
}

export async function createOffer(dto: CreateOfferDto): Promise<Offer> {
  const response = await api.post<Offer>('/offers', dto);
  return response.data;
}

export async function updateOffer(
  id: string,
  dto: UpdateOfferDto
): Promise<Offer> {
  const response = await api.put<Offer>(`/offers/${id}`, dto);
  return response.data;
}

export async function deleteOffer(id: string): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/offers/${id}`);
  return response.data;
}
