import { api } from "@/lib/api";
import { unwrapData, unwrapPaginated } from "@/lib/api-unwrap";
import {
  HolidayPark,
  CreateHolidayParkDto,
  UpdateHolidayParkDto,
  QueryHolidayParkDto,
  PaginatedHolidayParksResponse,
} from "../types/holiday-parks.types";

export async function fetchHolidayParks(
  query?: QueryHolidayParkDto
): Promise<PaginatedHolidayParksResponse> {
  const response = await api.get("/holiday-parks", {
    params: query,
  });
  const paginated = unwrapPaginated<HolidayPark>(response.data);
  return {
    items: paginated.items,
    meta: paginated.meta || { total: paginated.items.length, page: query?.page || 1, limit: query?.limit || 10, totalPages: 1 },
  };
}

export const fetchAdminHolidayParks = fetchHolidayParks;

export async function fetchFeaturedHolidayParks(): Promise<HolidayPark[]> {
  const response = await api.get("/holiday-parks/featured");
  return unwrapData<HolidayPark[]>(response.data) || [];
}

export async function fetchHolidayParkById(id: string): Promise<HolidayPark> {
  const response = await api.get(`/holiday-parks/${id}`);
  return unwrapData<HolidayPark>(response.data);
}

export const fetchHolidayParkDetails = fetchHolidayParkById;

export async function createHolidayPark(
  dto: CreateHolidayParkDto
): Promise<HolidayPark> {
  const response = await api.post("/holiday-parks", dto);
  return unwrapData<HolidayPark>(response.data);
}

export async function updateHolidayPark(
  id: string,
  dto: UpdateHolidayParkDto
): Promise<HolidayPark> {
  const response = await api.put(`/holiday-parks/${id}`, dto);
  return unwrapData<HolidayPark>(response.data);
}

export async function deleteHolidayPark(id: string): Promise<{ message: string }> {
  const response = await api.delete(`/holiday-parks/${id}`);
  return unwrapData<{ message: string }>(response.data);
}
