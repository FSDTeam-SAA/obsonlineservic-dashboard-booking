export interface User {
  _id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  profileImage?: string;
  phone?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  phone?: string;
}

export interface RegisterResponse {
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  };
}

export interface LoginResponse {
  message: string;
  data: {
    user: User & { refreshToken: string };
    accessToken: string;
  };
}

export interface RefreshTokenResponse {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}
