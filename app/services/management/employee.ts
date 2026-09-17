/**
 * Employee Management API Service
 * Manages employee records and related data
 */

import { BaseService } from '../base';

const API_PATH = '/api/v1/internal/employees';

export interface Employee {
  id: number;
  employee_code: string;
  full_name: string;
  email?: string;
  phone?: string;
  division?: string;
  department?: string;
  position?: string;
  employee_type: 'STAFF' | 'CONTRACT' | 'OUTSOURCING' | 'PART_TIME';
  rate_class?: string;
  base_salary?: number;
  salary_type: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'HOURLY';
  join_date?: string;
  resign_date?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'RESIGNED' | 'ON_LEAVE';
  branch_id?: number;
  branch_name?: string;
  branch_code?: string;
  branch_type?: string;
  created_at: string;
  updated_at?: string;
}

export interface EmployeeCreate {
  employee_code: string;
  full_name: string;
  email?: string;
  phone?: string;
  division?: string;
  department?: string;
  position?: string;
  employee_type?: 'STAFF' | 'CONTRACT' | 'OUTSOURCING' | 'PART_TIME';
  rate_class?: string;
  base_salary?: number;
  salary_type?: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'HOURLY';
  join_date?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'RESIGNED' | 'ON_LEAVE';
  branch_id?: number;
}

export interface EmployeeUpdate {
  full_name?: string;
  email?: string;
  phone?: string;
  division?: string;
  department?: string;
  position?: string;
  employee_type?: 'STAFF' | 'CONTRACT' | 'OUTSOURCING' | 'PART_TIME';
  rate_class?: string;
  base_salary?: number;
  salary_type?: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'HOURLY';
  join_date?: string;
  resign_date?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'RESIGNED' | 'ON_LEAVE';
  branch_id?: number;
}

export interface EmployeeShift {
  id: number;
  employee_id: number;
  shift_name: string;
  start_time: string;
  end_time: string;
  work_days: string;
  break_minutes: number;
  effective_from?: string;
  effective_to?: string;
  created_at: string;
}

export interface EmployeeShiftCreate {
  shift_name: string;
  start_time: string;
  end_time: string;
  work_days?: string;
  break_minutes?: number;
  effective_from?: string;
}

export interface EmployeeDeduction {
  id: number;
  employee_id: number;
  deduction_type: string;
  amount: number;
  period_month: string;
  note?: string;
  created_at: string;
}

export interface EmployeeDeductionCreate {
  deduction_type: string;
  amount: number;
  period_month: string;
  note?: string;
}

export interface EmployeeFilter {
  search?: string;
  status?: string;
  employee_type?: string;
  branch_id?: number;
  department?: string;
  division?: string;
  page?: number;
  page_size?: number;
  [key: string]: string | number | boolean | undefined;
}

class EmployeeService extends BaseService {
  /**
   * List employees
   */
  async list(filter?: EmployeeFilter): Promise<{ data: Employee[]; total: number }> {
    const params = this.buildQueryParams(filter);
    return this.get<{ data: Employee[]; total: number }>(`${API_PATH}${params}`);
  }

  /**
   * Get employee by ID (with shifts and deductions)
   */
  async getById(id: number): Promise<Employee & { shifts: EmployeeShift[]; deductions: EmployeeDeduction[] }> {
    return this.get<Employee & { shifts: EmployeeShift[]; deductions: EmployeeDeduction[] }>(`${API_PATH}/${id}`);
  }

  /**
   * Create employee
   */
  async create(data: EmployeeCreate): Promise<Employee> {
    return this.post<Employee>(API_PATH, data);
  }

  /**
   * Update employee
   */
  async update(id: number, data: EmployeeUpdate): Promise<Employee> {
    return this.put<Employee>(`${API_PATH}/${id}`, data);
  }

  /**
   * Delete employee
   */
  async remove(id: number): Promise<void> {
    await this.delete(`${API_PATH}/${id}`);
  }

  // ============ Shifts ============

  /**
   * Add shift schedule to employee
   */
  async addShift(employeeId: number, shift: EmployeeShiftCreate): Promise<EmployeeShift> {
    return this.post<EmployeeShift>(`${API_PATH}/${employeeId}/shifts`, shift);
  }

  /**
   * Delete employee shift
   */
  async deleteShift(employeeId: number, shiftId: number): Promise<void> {
    await this.delete(`${API_PATH}/${employeeId}/shifts/${shiftId}`);
  }

  // ============ Deductions ============

  /**
   * Add deduction to employee
   */
  async addDeduction(employeeId: number, deduction: EmployeeDeductionCreate): Promise<EmployeeDeduction> {
    return this.post<EmployeeDeduction>(`${API_PATH}/${employeeId}/deductions`, deduction);
  }

  /**
   * Delete employee deduction
   */
  async deleteDeduction(employeeId: number, deductionId: number): Promise<void> {
    await this.delete(`${API_PATH}/${employeeId}/deductions/${deductionId}`);
  }
}

export default new EmployeeService();
export { EmployeeService };
export const employeeService = new EmployeeService();
