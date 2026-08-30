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

export async function fetchPropertiesByPark(
  parkId: string,
  query?: PropertyQueryDto
): Promise<{ park?: any; items: Property[]; meta: any }> {
  try {
    const response = await api.get(`/holiday-parks/${parkId}/properties`, {
      params: query,
    });
    const data = response.data?.data || response.data;
    return {
      park: data?.park,
      items: data?.items || [],
      meta: data?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 },
    };
  } catch (err) {
    console.warn('Direct park properties route failed, falling back to /properties query:', err);
    // Fallback: fetch park details & properties list in parallel
    const [parkRes, propertiesRes] = await Promise.allSettled([
      api.get(`/holiday-parks/${parkId}`),
      api.get('/properties', {
        params: { ...query, holidayPark: parkId },
      }),
    ]);

    const parkData = parkRes.status === 'fulfilled' ? unwrapData<any>(parkRes.value.data) : null;
    let items: Property[] = [];
    let meta = { total: 0, page: 1, limit: 10, totalPages: 1 };

    if (propertiesRes.status === 'fulfilled') {
      const paginated = unwrapPaginated<Property>(propertiesRes.value.data);
      items = paginated.items;
      meta = paginated.meta || { total: items.length, page: 1, limit: 10, totalPages: 1 };
    }

    return {
      park: parkData,
      items,
      meta,
    };
  }
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
