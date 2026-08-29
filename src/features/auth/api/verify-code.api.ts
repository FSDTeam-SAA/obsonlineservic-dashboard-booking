import { api } from "@/lib/api";

export async function verifyCode(email: string, otp: string): Promise<void> {
  await api.post("/auth/verify-code", { email, otp });
}
