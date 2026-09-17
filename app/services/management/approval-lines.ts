/**
 * Approval Lines API Service
 * Manages approval configurations, workflows, and RBAC
 */

import { BaseService } from '../base';

const API_PATH = '/api/v1/approval-lines';

// ============ Types ============

// Approval Configuration
export interface ApprovalLevel {
  id?: number;
  level: number;
  name: string;
  approver_type: 'USER' | 'ROLE' | 'DEPARTMENT_HEAD' | 'DIVISION_HEAD';
  approver?: string; // for view/compatibility
  approver_id?: number;
  approver_ids?: number[];
  approver_name?: string;
  is_auto_approve: boolean;
  timeout_hours?: number;
  is_active: boolean;
}

export interface ApprovalConfiguration {
  id: number;
  name: string;
  description?: string;
  form_type: string;
  department_id?: number;
  department_name?: string;
  department?: string; // for view/compatibility
  division_id?: number;
  division_name?: string;
  division?: string; // for view/compatibility
  branch_id?: number;
  branch_name?: string;
  min_amount?: number;
  max_amount?: number;
  is_active: boolean;
  level_count: number;
  levels: ApprovalLevel[];
  created_at: string;
  created_by?: string; // for view/compatibility
  updated_at?: string;
}

export interface ApprovalConfigCreate {
  name: string;
  description?: string;
  form_type: string;
  department_id?: number;
  department?: string; // for view/compatibility
  division_id?: number;
  division?: string; // for view/compatibility
  branch_id?: number;
  min_amount?: number;
  max_amount?: number;
  is_active?: boolean;
  levels: ApprovalLevelCreate[];
}

export interface ApprovalConfigUpdate {
  name?: string;
  description?: string;
  form_type?: string;
  department_id?: number;
  department?: string; // for view/compatibility
  division_id?: number;
  division?: string; // for view/compatibility
  branch_id?: number;
  min_amount?: number;
  max_amount?: number;
  is_active?: boolean;
}

export interface ApprovalLevelCreate {
  level: number;
  name: string;
  approver_type: 'USER' | 'ROLE' | 'DEPARTMENT_HEAD' | 'DIVISION_HEAD';
  approver_id?: number;
  approver_ids?: number[];
  is_auto_approve?: boolean;
  timeout_hours?: number;
}

// Approval Request
export interface ApprovalRequest {
  id: number;
  config_id: number;
  config_name: string;
  form_type: string;
  reference_id: string;
  requester_id: number;
  requester_name?: string;
  requester?: string; // for view/compatibility
  department_id?: number;
  department_name?: string;
  department?: string; // for view/compatibility
  division_id?: number;
  division_name?: string;
  division?: string; // for view/compatibility
  amount?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  current_level?: number;
  current_approver?: string; // for view/compatibility
  submitted_at?: string; // for view/compatibility
  completed_at?: string; // for view/compatibility
  rejected_at?: string; // for view/compatibility
  rejection_reason?: string; // for view/compatibility
  data_json?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface ApprovalRequestCreate {
  config_id: number;
  form_type: string;
  reference_id: string;
  requester_id: number;
  department_id?: number;
  division_id?: number;
  amount?: number;
  data_json?: Record<string, unknown>;
}

export interface ApprovalAction {
  action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO';
  note?: string;
}

// RBAC Types
export interface Permission {
  id: number;
  code: string;
  name: string;
  module: string;
  description?: string;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_system: boolean;
  permission_count: number;
  user_count: number;
  created_at: string;
  updated_at?: string;
}

export interface RolePermission {
  id: number;
  role_id: number;
  permission_id: number;
  permission_code: string;
  page_access: Record<string, boolean>;
  crud_access: Record<string, string>;
}

// Filter types
export interface ApprovalConfigFilter {
  search?: string;
  form_type?: string;
  status?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface ApprovalRequestFilter {
  search?: string;
  status?: string;
  form_type?: string;
  config_id?: number;
  page?: number;
  page_size?: number;
  [key: string]: string | number | boolean | undefined;
}

// ============ Service ============

class ApprovalLinesService extends BaseService {
  // ============ Configurations ============

  /**
   * List approval configurations
   */
  async listConfigurations(filter?: ApprovalConfigFilter): Promise<{ data: ApprovalConfiguration[]; total: number }> {
    const params = this.buildQueryParams(filter);
    return this.get<{ data: ApprovalConfiguration[]; total: number }>(`${API_PATH}/configurations${params}`);
  }

  /**
   * Get configuration by ID
   */
  async getConfiguration(id: number): Promise<ApprovalConfiguration> {
    return this.get<ApprovalConfiguration>(`${API_PATH}/configurations/${id}`);
  }

  /**
   * Create approval configuration
   */
  async createConfiguration(data: ApprovalConfigCreate): Promise<ApprovalConfiguration> {
    return this.post<ApprovalConfiguration>(`${API_PATH}/configurations`, data);
  }

  /**
   * Update approval configuration
   */
  async updateConfiguration(id: number, data: ApprovalConfigUpdate): Promise<ApprovalConfiguration> {
    return this.put<ApprovalConfiguration>(`${API_PATH}/configurations/${id}`, data);
  }

  /**
   * Delete approval configuration
   */
  async deleteConfiguration(id: number): Promise<void> {
    await this.delete(`${API_PATH}/configurations/${id}`);
  }

  /**
   * Add approval level to configuration
   */
  async addConfigurationLevel(configId: number, level: ApprovalLevelCreate): Promise<ApprovalLevel> {
    return this.post<ApprovalLevel>(`${API_PATH}/configurations/${configId}/levels`, level);
  }

  /**
   * Update approval level
   */
  async updateConfigurationLevel(configId: number, levelId: number, level: Partial<ApprovalLevelCreate>): Promise<ApprovalLevel> {
    return this.put<ApprovalLevel>(`${API_PATH}/configurations/${configId}/levels/${levelId}`, level);
  }

  /**
   * Delete approval level
   */
  async deleteConfigurationLevel(configId: number, levelId: number): Promise<void> {
    await this.delete(`${API_PATH}/configurations/${configId}/levels/${levelId}`);
  }

  // ============ Approval Requests ============

  /**
   * List approval requests
   */
  async listRequests(filter?: ApprovalRequestFilter): Promise<{ data: ApprovalRequest[]; total: number }> {
    const params = this.buildQueryParams(filter);
    return this.get<{ data: ApprovalRequest[]; total: number }>(`${API_PATH}/requests${params}`);
  }

  /**
   * Get request by ID
   */
  async getRequest(id: number): Promise<ApprovalRequest> {
    return this.get<ApprovalRequest>(`${API_PATH}/requests/${id}`);
  }

  /**
   * Create approval request
   */
  async createRequest(data: ApprovalRequestCreate): Promise<ApprovalRequest> {
    return this.post<ApprovalRequest>(`${API_PATH}/requests`, data);
  }

  /**
   * Process approval action (approve/reject/request info)
   */
  async processRequest(id: number, action: ApprovalAction): Promise<ApprovalRequest> {
    return this.post<ApprovalRequest>(`${API_PATH}/requests/${id}/action`, action);
  }

  /**
   * Approve request (convenience method)
   */
  async approveRequest(id: number, data?: { notes?: string }): Promise<ApprovalRequest> {
    return this.processRequest(id, { action: 'APPROVE', note: data?.notes });
  }

  /**
   * Reject request (convenience method)
   */
  async rejectRequest(id: number, data?: { notes?: string }): Promise<ApprovalRequest> {
    return this.processRequest(id, { action: 'REJECT', note: data?.notes });
  }

  /**
   * Cancel approval request
   */
  async cancelRequest(id: number): Promise<void> {
    await this.post(`${API_PATH}/requests/${id}/cancel`);
  }

  /**
   * Get request history
   */
  async getRequestHistory(id: number): Promise<ApprovalRequest[]> {
    return this.get<ApprovalRequest[]>(`${API_PATH}/requests/${id}/history`);
  }

  // ============ RBAC ============

  /**
   * List roles
   */
  async listRoles(): Promise<{ data: Role[]; total: number }> {
    return this.get<{ data: Role[]; total: number }>(`${API_PATH}/rbac/roles`);
  }

  /**
   * Get role by ID
   */
  async getRole(id: number): Promise<Role> {
    return this.get<Role>(`${API_PATH}/rbac/roles/${id}`);
  }

  /**
   * List permissions
   */
  async listPermissions(): Promise<{ data: Permission[]; total: number }> {
    return this.get<{ data: Permission[]; total: number }>(`${API_PATH}/rbac/permissions`);
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(roleId: number): Promise<RolePermission> {
    return this.get<RolePermission>(`${API_PATH}/rbac/roles/${roleId}/permissions`);
  }

  /**
   * Update role permissions
   */
  async updateRolePermissions(roleId: number, data: { permission_ids: number[]; page_access: Record<string, boolean>; crud_access: Record<string, string> }): Promise<RolePermission> {
    return this.put<RolePermission>(`${API_PATH}/rbac/roles/${roleId}/permissions`, data);
  }

  // ============ Form Types ============

  /**
   * List available form types
   */
  async listFormTypes(): Promise<{ form_types: string[] }> {
    return this.get<{ form_types: string[] }>(`${API_PATH}/form-types`);
  }
}

export default new ApprovalLinesService();
export { ApprovalLinesService };
export const approvalLinesService = new ApprovalLinesService();
