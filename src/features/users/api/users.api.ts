import { api } from "@/lib/api";
import { UsersListResponse, UserDetailsResponse, AdminUpdateUserDto, GetUsersQueryDto } from "../types";

export async function getAllUsers(query: GetUsersQueryDto): Promise<UsersListResponse> {
  const response = await api.get<UsersListResponse>("/user/all-users", {
    params: query,
  });
  return response.data;
}

export async function getUserById(id: string): Promise<UserDetailsResponse> {
  const response = await api.get<UserDetailsResponse>(`/user/${id}`);
  return response.data;
}

export async function updateUser(id: string, data: AdminUpdateUserDto): Promise<UserDetailsResponse> {
  const response = await api.put<UserDetailsResponse>(`/user/${id}`, data);
  return response.data;
}

export async function deleteUser(id: string): Promise<{ message: string; data: null }> {
  const response = await api.delete<{ message: string; data: null }>(`/user/${id}`);
  return response.data;
}
