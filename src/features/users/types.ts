export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isVerified?: boolean;
  hasActiveSubscription?: boolean;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUsersQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  date?: string;
}

export interface AdminUpdateUserDto {
  name?: string;
  role?: "user" | "admin";
  isVerified?: boolean;
  hasActiveSubscription?: boolean;
}

export interface UsersListResponse {
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  data: {
    users: AdminUser[];
    paginationInfo: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface UserDetailsResponse {
  message: string;
  data: AdminUser;
}
