import { api } from "@/lib/api";

export interface SettingsProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  profileImage?: string;
  createdAt: string;
}

export interface SettingsProfileResponse {
  message: string;
  data: SettingsProfile;
}

export async function getProfile(): Promise<SettingsProfileResponse> {
  const response = await api.get<SettingsProfileResponse>("/user/me");
  return response.data;
}

export async function updateProfile(data: { name: string; phone?: string }): Promise<SettingsProfileResponse> {
  const response = await api.put<SettingsProfileResponse>("/user/me", data);
  return response.data;
}

export async function uploadAvatar(file: File): Promise<SettingsProfileResponse> {
  const formData = new FormData();
  formData.append("profileImage", file);
  const response = await api.post<SettingsProfileResponse>("/user/upload-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function deleteAvatar(): Promise<SettingsProfileResponse> {
  const response = await api.delete<SettingsProfileResponse>("/user/upload-avatar");
  return response.data;
}

export async function changePassword(data: any): Promise<{ message: string; data: null }> {
  const response = await api.post<{ message: string; data: null }>("/auth/change-password", data);
  return response.data;
}
