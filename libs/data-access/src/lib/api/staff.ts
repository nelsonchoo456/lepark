import axios, { AxiosResponse } from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3333/api/staffs', // Replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // optional: specify request timeout in milliseconds
});

interface RegisterStaffData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  role: string;
  isActive: boolean;
}

interface StaffResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  role: string;
  isActive: boolean;
}

export async function registerStaff(data: RegisterStaffData): Promise<AxiosResponse<StaffResponse>> {
  try {
    const response: AxiosResponse<StaffResponse> = await axiosClient.post('/register', data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}
