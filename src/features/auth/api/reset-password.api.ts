import { api } from "@/lib/api";

export async function resetPassword(email: string, newPassword: string): Promise<void> {
  await api.post("/auth/reset-password", { email, newPassword });
}
