/**
 * User Management API Service
 * Manages user accounts, roles, and authentication
 */

import { BaseService } from '../base';

const API_PATH = '/api/v1/auth';

export interface User {
  id: number;
  key?: string;
  employee_id?: number;
  employeeId?: string; // for view/compatibility
  employee_code?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  phone?: string;
  full_name?: string;
  role: string;
  role_id?: number;
  department?: string;
  department_id?: number;
  position?: string;
  branch?: string;
  branch_id?: number;
  status: 'active' | 'inactive' | 'pending';
  last_login?: string;
  lastLogin?: string; // for view/compatibility
  created_at?: string;
  updated_at?: string;
  avatar_url?: string;
}

// TableUser for UI display
export interface TableUser extends User {
  key: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  role_id: number;
  employee_id?: number;
  branch_ids?: number[];
}

export interface UserUpdate {
  email?: string;
  role_id?: number;
  employee_id?: number;
  branch_ids?: number[];
  status?: 'active' | 'inactive';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface UserFilter {
  search?: string;
  role_id?: number;
  status?: string;
  branch_id?: number;
  page?: number;
  page_size?: number;
  [key: string]: string | number | boolean | undefined;
}

class UserService extends BaseService {
  /**
   * Login with username and password
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.post<LoginResponse>(`${API_PATH}/login`, data);
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await this.post(`${API_PATH}/logout`);
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return this.get<User>(`${API_PATH}/me`);
  }

  /**
   * List all users
   */
  async listUsers(filter?: UserFilter): Promise<{ data: User[]; total: number }> {
    const params = this.buildQueryParams(filter);
    return this.get<{ data: User[]; total: number }>(`${API_PATH}/users${params}`);
  }

  /**
   * Get user by ID
   */
  async getUser(id: number): Promise<User> {
    return this.get<User>(`${API_PATH}/users/${id}`);
  }

  /**
   * Create new user
   */
  async createUser(data: UserCreate): Promise<User> {
    return this.post<User>(`${API_PATH}/users`, data);
  }

  /**
   * Update user
   */
  async updateUser(id: number, data: UserUpdate): Promise<User> {
    return this.put<User>(`${API_PATH}/users/${id}`, data);
  }

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<void> {
    await this.delete(`${API_PATH}/users/${id}`);
  }

  /**
   * Change user password
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    await this.post(`${API_PATH}/users/${userId}/change-password`, {
      old_password: oldPassword,
      new_password: newPassword
    });
  }

  /**
   * Reset user password (admin only)
   */
  async resetPassword(userId: number): Promise<{ temporary_password: string }> {
    return this.post<{ temporary_password: string }>(`${API_PATH}/users/${userId}/reset-password`);
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId?: number): Promise<{ permissions: string[]; pages: Record<string, boolean> }> {
    const endpoint = userId ? `${API_PATH}/users/${userId}/permissions` : `${API_PATH}/me/permissions`;
    return this.get(endpoint);
  }
}

export default new UserService();
export { UserService };
export const userService = new UserService();
