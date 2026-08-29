import { api } from '@/lib/api';
import { unwrapData, unwrapPaginated } from '@/lib/api-unwrap';
import {
  Property,
  PropertyStats,
  PropertyQueryDto,
  PaginatedPropertiesResponse,
  CreatePropertyDto,
  UpdatePropertyDto,
} from '../types/properties.types';
// Upload helper — delegates to shared upload API
export { uploadSingleImage as uploadPropertyImage } from '@/features/upload/api/upload.api';

export async function fetchAdminProperties(
  query?: PropertyQueryDto
): Promise<PaginatedPropertiesResponse> {
  const response = await api.get('/properties', {
    params: query,
  });
  const paginated = unwrapPaginated<Property>(response.data);
  return {
    items: paginated.items,
    meta: paginated.meta || { total: paginated.items.length, page: query?.page || 1, limit: query?.limit || 10, totalPages: 1 },
  };
}

export async function fetchPopularProperties(): Promise<Property[]> {
  const response = await api.get('/properties/popular');
  return unwrapData<Property[]>(response.data) || [];
}

export async function fetchPropertyById(id: string): Promise<Property> {
  const response = await api.get(`/properties/${id}`);
  return unwrapData<Property>(response.data);
}

export async function createProperty(
  dto: CreatePropertyDto
): Promise<Property> {
  const response = await api.post('/properties', dto);
  return unwrapData<Property>(response.data);
}

export async function updateProperty(
  id: string,
  dto: UpdatePropertyDto
): Promise<Property> {
  const response = await api.put(`/properties/${id}`, dto);
  return unwrapData<Property>(response.data);
}

export async function deleteProperty(
  id: string
): Promise<{ message: string }> {
  const response = await api.delete(`/properties/${id}`);
  return unwrapData<{ message: string }>(response.data);
}

export async function fetchPropertyStats(): Promise<PropertyStats> {
  const [all, active, draft, archived] = await Promise.all([
    fetchAdminProperties({ page: 1, limit: 1 }),
    fetchAdminProperties({ page: 1, limit: 1, status: 'Active' }),
    fetchAdminProperties({ page: 1, limit: 1, status: 'Draft' }),
    fetchAdminProperties({ page: 1, limit: 1, status: 'Archived' }),
  ]);

  return {
    total: all.meta?.total || 0,
    active: active.meta?.total || 0,
    draft: draft.meta?.total || 0,
    archived: archived.meta?.total || 0,
  };
}
