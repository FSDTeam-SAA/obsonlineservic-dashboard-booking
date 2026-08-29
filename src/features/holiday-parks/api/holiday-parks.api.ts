import { api } from "@/lib/api";
import {
  QueryHolidayParkAdmin,
  AdminPaginatedHolidayParksResponse,
  SingleAdminHolidayParkResponse,
  CreateHolidayParkPayload,
  UpdateHolidayParkPayload,
  HolidayParkItem,
} from "../types";
// Delegate to the shared upload module — single source of truth
export { uploadSingleImage as uploadImageFile } from "@/features/upload/api/upload.api";

export async function fetchAdminHolidayParks(
  query?: QueryHolidayParkAdmin
): Promise<AdminPaginatedHolidayParksResponse["data"]> {
  const response = await api.get<AdminPaginatedHolidayParksResponse>("/holiday-parks", {
    params: query,
  });
  return response.data.data;
}

export async function fetchHolidayParkDetails(id: string): Promise<HolidayParkItem> {
  const response = await api.get<SingleAdminHolidayParkResponse>(`/holiday-parks/${id}`);
  return response.data.data;
}

export async function createHolidayPark(
  payload: CreateHolidayParkPayload
): Promise<HolidayParkItem> {
  const response = await api.post<SingleAdminHolidayParkResponse>("/holiday-parks", payload);
  return response.data.data;
}

export async function updateHolidayPark(
  id: string,
  payload: UpdateHolidayParkPayload
): Promise<HolidayParkItem> {
  const response = await api.put<SingleAdminHolidayParkResponse>(`/holiday-parks/${id}`, payload);
  return response.data.data;
}

export async function deleteHolidayPark(id: string): Promise<boolean> {
  const response = await api.delete<{ statusCode: number; success: boolean; data: { deleted: boolean } }>(
    `/holiday-parks/${id}`
  );
  return response.data.data?.deleted ?? true;
}
