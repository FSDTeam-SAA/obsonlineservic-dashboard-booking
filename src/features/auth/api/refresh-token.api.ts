import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5010/api/v1";

interface RefreshTokenResponse {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export async function refreshUserToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await axios.post<RefreshTokenResponse>(`${BACKEND_URL}/auth/refresh-access-token`, {
    refreshToken: token,
  });
  return response.data.data;
}
