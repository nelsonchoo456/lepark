export enum StaffType {
  MANAGER = 'MANAGER',
  BOTANIST = 'BOTANIST',
  ARBORIST = 'ARBORIST',
  GARDENER = 'GARDENER',
  MAINTENANCE_WORKER = 'MAINTENANCE_WORKER',
  CLEANER = 'CLEANER',
  LANDSCAPE_ARCHITECT = 'LANDSCAPE_ARCHITECT',
  PARK_RANGER = 'PARK_RANGER',
  SUPERADMIN = 'SUPERADMIN',
}

export interface RegisterStaffData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  role: StaffType;
  parkId?: string;
}

export interface StaffResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  role: string;
  isActive: boolean;
  parkId?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LogoutResponse {
  message: string;
}

export interface StaffUpdateData {
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  email?: string;
}

export interface PasswordResetRequestData {
  email: string;
}

export interface PasswordResetData {
  token: string;
  newPassword: string;
}
