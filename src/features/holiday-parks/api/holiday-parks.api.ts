import { api } from "@/lib/api";
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
  const response = await api.get<PaginatedHolidayParksResponse>("/holiday-parks", {
    params: query,
  });
  return response.data;
}

export const fetchAdminHolidayParks = fetchHolidayParks;

export async function fetchHolidayParkById(id: string): Promise<HolidayPark> {
  const response = await api.get<{ message: string; data: HolidayPark }>(
    `/holiday-parks/${id}`
  );
  return response.data.data;
}

export const fetchHolidayParkDetails = fetchHolidayParkById;

export async function createHolidayPark(
  dto: CreateHolidayParkDto
): Promise<HolidayPark> {
  const response = await api.post<{ message: string; data: HolidayPark }>(
    "/holiday-parks",
    dto
  );
  return response.data.data;
}

export async function updateHolidayPark(
  id: string,
  dto: UpdateHolidayParkDto
): Promise<HolidayPark> {
  const response = await api.put<{ message: string; data: HolidayPark }>(
    `/holiday-parks/${id}`,
    dto
  );
  return response.data.data;
}

export async function deleteHolidayPark(id: string): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/holiday-parks/${id}`);
  return response.data;
}
