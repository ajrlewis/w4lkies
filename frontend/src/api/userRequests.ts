
import { User } from '@/types/interfaces';
import { apiRequest, apiRequestWithResponse } from './apiService';

// Fetch all Users
export const fetchUsers = async (): Promise<User[]> => {
  return await apiRequest<User[]>('/users');
};

// Fetch active Users
export const fetchActiveUsers = async (): Promise<User[]> => {
  return await apiRequest<User[]>('/users?is_active=true');
};

export interface UserUpdatePayload {
  username?: string;
  email?: string;
  is_admin?: boolean;
  is_active?: boolean;
}

export interface UserCreatePayload {
  username: string;
  email: string;
  password: string;
  is_admin?: boolean;
  is_active?: boolean;
}

export interface ChangeMyPasswordPayload {
  current_password: string;
  new_password: string;
}

interface FetchUsersOptions {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  search?: string;
}

export const fetchUsersPaginated = async (
  options: FetchUsersOptions = {}
): Promise<{ data: User[]; response: Response }> => {
  const params = new URLSearchParams();
  if (options.page) params.set("page", options.page.toString());
  if (options.page_size) params.set("page_size", options.page_size.toString());
  if (typeof options.is_active === "boolean") params.set("is_active", String(options.is_active));
  if (options.search) params.set("search", options.search);

  const query = params.toString();
  return await apiRequestWithResponse<User[]>(`/users${query ? `?${query}` : ""}`);
};

export const updateUser = async (
  userId: number,
  data: UserUpdatePayload
): Promise<User> => {
  return await apiRequest<User>(`/users/${userId}`, 'PUT', data);
};

export const createUser = async (data: UserCreatePayload): Promise<User> => {
  return await apiRequest<User>("/users", "POST", data);
};

export const changeMyPassword = async (
  data: ChangeMyPasswordPayload
): Promise<void> => {
  return await apiRequest<void>("/users/me/password", "PUT", data);
};
