import { ParkResponse } from './park';

export enum StaffType {
  MANAGER = 'MANAGER',
  BOTANIST = 'BOTANIST',
  ARBORIST = 'ARBORIST',
  LANDSCAPE_ARCHITECT = 'LANDSCAPE_ARCHITECT',
  PARK_RANGER = 'PARK_RANGER',
  VENDOR_MANAGER = 'VENDOR_MANAGER',
  SUPERADMIN = 'SUPERADMIN',
}

export interface RegisterStaffData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  role: StaffType;
  parkId?: number;
  isFirstLogin: boolean;
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
  parkId?: number;
  park?: ParkResponse;
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

export interface PasswordChangeData {
  newPassword: string;
  currentPassword: string;
  staffId: string;
}
