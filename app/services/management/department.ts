/**
 * Department & Division API Service
 * Manages organizational structure
 */

import { BaseService } from '../base';

const API_PATH = '/api/v1/departments';

export interface Department {
  id: number;
  name: string;
  code: string;
  division_id?: number;
  division_name?: string;
  division?: string; // for view/compatibility
  manager_id?: number;
  manager_name?: string;
  manager?: string | null; // for view/compatibility (nullable)
  parent_id?: number;
  parent_name?: string;
  description?: string;
  status: 'active' | 'inactive';
  employee_count?: number;
  headCount?: number; // for view/compatibility
  created_at?: string;
  updated_at?: string;
}

// TableDepartment for UI display
export interface TableDepartment extends Department {
  key: string;
}

export interface DepartmentCreate {
  name: string;
  code: string;
  division_id?: number;
  manager_id?: number;
  parent_id?: number;
  description?: string;
}

export interface DepartmentUpdate {
  name?: string;
  division_id?: number;
  manager_id?: number;
  parent_id?: number;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface DepartmentFilter {
  search?: string;
  division_id?: number;
  status?: string;
  page?: number;
  page_size?: number;
  [key: string]: string | number | boolean | undefined;
}

// Division types
export interface Division {
  id: number;
  name: string;
  code: string;
  description?: string;
  head_id?: number;
  head_name?: string;
  manager_name?: string;
  manager?: string | null; // for view/compatibility (nullable)
  status: 'active' | 'inactive';
  department_count?: number;
  total_headcount?: number; // for view/compatibility
  created_at?: string;
  updated_at?: string;
}

// TableDivision for UI display
export interface TableDivision extends Division {
  key: string;
}

export interface DivisionCreate {
  name: string;
  code: string;
  head_id?: number;
  description?: string;
}

export interface DivisionUpdate {
  name?: string;
  head_id?: number;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface DivisionFilter {
  search?: string;
  status?: string;
  page?: number;
  page_size?: number;
  [key: string]: string | number | boolean | undefined;
}

class DepartmentService extends BaseService {
  /**
   * List departments
   */
  async list(filter?: DepartmentFilter): Promise<{ data: Department[]; total: number }> {
    const params = this.buildQueryParams(filter);
    return this.get<{ data: Department[]; total: number }>(`${API_PATH}${params}`);
  }

  /**
   * Get department by ID
   */
  async getById(id: number): Promise<Department> {
    return this.get<Department>(`${API_PATH}/${id}`);
  }

  /**
   * Create department
   */
  async create(data: DepartmentCreate): Promise<Department> {
    return this.post<Department>(API_PATH, data);
  }

  /**
   * Update department
   */
  async update(id: number, data: DepartmentUpdate): Promise<Department> {
    return this.put<Department>(`${API_PATH}/${id}`, data);
  }

  /**
   * Delete department
   */
  async remove(id: number): Promise<void> {
    await this.delete(`${API_PATH}/${id}`);
  }
}

// Division service (same class, different path)
class DivisionService extends BaseService {
  private divisionPath = '/api/v1/divisions';

  /**
   * List divisions
   */
  async list(filter?: DivisionFilter): Promise<{ data: Division[]; total: number }> {
    const params = this.buildQueryParams(filter);
    return this.get<{ data: Division[]; total: number }>(`${this.divisionPath}${params}`);
  }

  /**
   * Get division by ID
   */
  async getById(id: number): Promise<Division> {
    return this.get<Division>(`${this.divisionPath}/${id}`);
  }

  /**
   * Create division
   */
  async create(data: DivisionCreate): Promise<Division> {
    return this.post<Division>(this.divisionPath, data);
  }

  /**
   * Update division
   */
  async update(id: number, data: DivisionUpdate): Promise<Division> {
    return this.put<Division>(`${this.divisionPath}/${id}`, data);
  }

  /**
   * Delete division
   */
  async remove(id: number): Promise<void> {
    await this.delete(`${this.divisionPath}/${id}`);
  }
}

export const departmentService = new DepartmentService();
export const divisionService = new DivisionService();
export { DepartmentService, DivisionService };
export default departmentService;
