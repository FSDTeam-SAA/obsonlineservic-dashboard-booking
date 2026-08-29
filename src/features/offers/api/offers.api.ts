import { api } from '@/lib/api';
import { unwrapData, unwrapPaginated } from '@/lib/api-unwrap';
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
  const response = await api.get('/offers', {
    params: query,
  });
  const paginated = unwrapPaginated<Offer>(response.data);
  return {
    items: paginated.items,
    meta: paginated.meta || { total: paginated.items.length, page: query?.page || 1, limit: query?.limit || 10, totalPages: 1 },
  };
}

export async function fetchActiveOffers(): Promise<Offer[]> {
  const response = await api.get('/offers/active');
  return unwrapData<Offer[]>(response.data) || [];
}

export async function fetchOfferById(id: string): Promise<Offer> {
  const response = await api.get(`/offers/${id}`);
  return unwrapData<Offer>(response.data);
}

export async function createOffer(dto: CreateOfferDto): Promise<Offer> {
  const response = await api.post('/offers', dto);
  return unwrapData<Offer>(response.data);
}

export async function updateOffer(
  id: string,
  dto: UpdateOfferDto
): Promise<Offer> {
  const response = await api.put(`/offers/${id}`, dto);
  return unwrapData<Offer>(response.data);
}

export async function deleteOffer(id: string): Promise<{ message: string }> {
  const response = await api.delete(`/offers/${id}`);
  return unwrapData<{ message: string }>(response.data);
}
