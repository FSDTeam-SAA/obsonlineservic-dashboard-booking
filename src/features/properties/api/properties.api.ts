import { api } from '@/lib/api';
import {
  Property,
  PropertyStats,
  PropertyQueryDto,
  PaginatedPropertiesResponse,
  CreatePropertyDto,
  UpdatePropertyDto,
} from '../types/properties.types';
import { ApiEnvelope, unwrapApiResponse } from './response';
// Upload helper — delegates to shared upload API
export { uploadSingleImage as uploadPropertyImage } from '@/features/upload/api/upload.api';

export async function fetchAdminProperties(
  query?: PropertyQueryDto
): Promise<PaginatedPropertiesResponse> {
  const response = await api.get<ApiEnvelope<PaginatedPropertiesResponse>>('/properties', {
    params: query,
  });
  return unwrapApiResponse(response.data);
}

export async function fetchPropertyById(id: string): Promise<Property> {
  const response = await api.get<ApiEnvelope<Property>>(`/properties/${id}`);
  return unwrapApiResponse(response.data);
}

export async function createProperty(
  dto: CreatePropertyDto
): Promise<Property> {
  const response = await api.post<ApiEnvelope<Property>>('/properties', dto);
  return unwrapApiResponse(response.data);
}

export async function updateProperty(
  id: string,
  dto: UpdatePropertyDto
): Promise<Property> {
  const response = await api.put<ApiEnvelope<Property>>(`/properties/${id}`, dto);
  return unwrapApiResponse(response.data);
}

export async function deleteProperty(
  id: string
): Promise<{ message: string }> {
  const response = await api.delete<ApiEnvelope<{ message: string }>>(`/properties/${id}`);
  return unwrapApiResponse(response.data);
}

export async function fetchPropertyStats(): Promise<PropertyStats> {
  const [all, active, draft, archived] = await Promise.all([
    fetchAdminProperties({ page: 1, limit: 1 }),
    fetchAdminProperties({ page: 1, limit: 1, status: 'Active' }),
    fetchAdminProperties({ page: 1, limit: 1, status: 'Draft' }),
    fetchAdminProperties({ page: 1, limit: 1, status: 'Archived' }),
  ]);

  return {
    total: all.meta.total,
    active: active.meta.total,
    draft: draft.meta.total,
    archived: archived.meta.total,
  };
}
