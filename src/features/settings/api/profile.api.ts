import { api } from "@/lib/api";
import { unwrapData } from "@/lib/api-unwrap";

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
  const response = await api.get("/user/me");
  const unwrapped = unwrapData<SettingsProfile>(response.data);
  return {
    message: "Profile fetched successfully",
    data: unwrapped,
  };
}

export async function updateProfile(data: { name: string; phone?: string }): Promise<SettingsProfileResponse> {
  const response = await api.put("/user/me", data);
  const unwrapped = unwrapData<SettingsProfile>(response.data);
  return {
    message: "Profile updated successfully",
    data: unwrapped,
  };
}

export async function uploadAvatar(file: File): Promise<SettingsProfileResponse> {
  const formData = new FormData();
  formData.append("profileImage", file);
  const response = await api.post("/user/upload-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  const unwrapped = unwrapData<SettingsProfile>(response.data);
  return {
    message: "Avatar uploaded successfully",
    data: unwrapped,
  };
}

export async function deleteAvatar(): Promise<SettingsProfileResponse> {
  const response = await api.delete("/user/upload-avatar");
  const unwrapped = unwrapData<SettingsProfile>(response.data);
  return {
    message: "Avatar deleted successfully",
    data: unwrapped,
  };
}

export async function changePassword(data: any): Promise<{ message: string; data: null }> {
  const response = await api.post("/auth/change-password", data);
  return unwrapData<{ message: string; data: null }>(response.data);
}
