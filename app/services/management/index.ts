/**
 * Management Services Index
 * Centralized exports for all management API services
 */

// User Management
export { default as userService, default as UserService } from './user';
export type {
  User,
  UserCreate,
  UserUpdate,
  LoginRequest,
  LoginResponse,
  UserFilter
} from './user';

// Department & Division
export { default as departmentService, DepartmentService, divisionService, DivisionService } from './department';
export type {
  Department,
  DepartmentCreate,
  DepartmentUpdate,
  DepartmentFilter,
  Division,
  DivisionCreate,
  DivisionUpdate,
  DivisionFilter
} from './department';

// Employee Management
export { default as employeeService, EmployeeService } from './employee';
export type {
  Employee,
  EmployeeCreate,
  EmployeeUpdate,
  EmployeeShift,
  EmployeeShiftCreate,
  EmployeeDeduction,
  EmployeeDeductionCreate,
  EmployeeFilter
} from './employee';

// Approval Lines
export { default as approvalLinesService, ApprovalLinesService } from './approval-lines';
export type {
  ApprovalConfiguration,
  ApprovalLevel,
  ApprovalRequest,
  Permission,
  Role,
  ApprovalConfigCreate,
  ApprovalConfigUpdate,
  ApprovalLevelCreate,
  ApprovalRequestCreate,
  ApprovalAction,
  ApprovalConfigFilter,
  ApprovalRequestFilter
} from './approval-lines';
