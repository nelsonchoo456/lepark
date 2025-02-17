import axios, { AxiosResponse } from 'axios';
import {
  LoginData,
  LogoutResponse,
  PasswordChangeData,
  PasswordResetData,
  PasswordResetRequestData,
  RegisterStaffData,
  StaffResponse,
  StaffType,
  StaffUpdateData,
} from '../types/staff';
import client from './client';

const URL = '/staffs';

export async function registerStaff(data: RegisterStaffData): Promise<AxiosResponse<StaffResponse>> {
  try {
    const response: AxiosResponse<StaffResponse> = await client.post(`${URL}/register`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllStaffs(): Promise<AxiosResponse<StaffResponse[]>> {
  try {
    const response: AxiosResponse<StaffResponse[]> = await client.get(`${URL}/getAllStaffs`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getAllStaffsByParkId(parkId?: number): Promise<AxiosResponse<StaffResponse[]>> {
  try {
    const response: AxiosResponse<StaffResponse[]> = await client.get(`${URL}/getAllStaffsByParkId/${parkId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function viewStaffDetails(id: string): Promise<AxiosResponse<StaffResponse>> {
  try {
    const response: AxiosResponse<StaffResponse> = await client.get(`${URL}/viewStaffDetails/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateStaffDetails(id: string, data: StaffUpdateData): Promise<AxiosResponse<StaffResponse>> {
  try {
    const response: AxiosResponse<StaffResponse> = await client.put(`${URL}/updateStaffDetails/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateStaffRole(id: string, role: StaffType, requesterId: string): Promise<AxiosResponse<StaffResponse>> {
  try {
    const response: AxiosResponse<StaffResponse> = await client.put(`${URL}/updateStaffRole/${id}`, { role, requesterId });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateStaffIsActive(id: string, isActive: boolean, requesterId: string): Promise<AxiosResponse<StaffResponse>> {
  try {
    const response: AxiosResponse<StaffResponse> = await client.put(`${URL}/updateStaffIsActive/${id}`, { isActive, requesterId });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function loginStaff(data: LoginData): Promise<AxiosResponse<StaffResponse>> {
  try {
    const response: AxiosResponse<StaffResponse> = await client.post(`${URL}/login`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function logoutStaff(): Promise<AxiosResponse<LogoutResponse>> {
  return client.post(`${URL}/logout`);
}

export async function forgotStaffPassword(data: PasswordResetRequestData): Promise<AxiosResponse<{ message: string }>> {
  try {
    const response: AxiosResponse<{ message: string }> = await client.post(`${URL}/forgot-password`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

// Change Password
export async function changeStaffPassword(data: PasswordChangeData): Promise<AxiosResponse<{ message: string }>> {
  try {
    const response: AxiosResponse<{ message: string }> = await client.put(`${URL}/change-password`,  data );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

// Reset Password
export async function resetStaffPassword(data: PasswordResetData): Promise<AxiosResponse<{ message: string }>> {
  try {
    const response: AxiosResponse<{ message: string }> = await client.post(`${URL}/reset-password`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function fetchStaff(): Promise<AxiosResponse<StaffResponse>> {
  return client.get(`${URL}/check-auth`);
}

export async function getTokenForResetPasswordForFirstLogin(staffId: string): Promise<AxiosResponse<{ token: string; message: string }>> {
  try {
    const response: AxiosResponse<{ token: string; message: string }> = await client.post(`${URL}/token-for-reset-password-for-first-login`, { staffId });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}