import { api } from "@/lib/api";

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forget-password", { email });
}
