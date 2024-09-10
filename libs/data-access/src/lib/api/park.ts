import axios, { AxiosResponse } from 'axios';
import { ParkData, ParkResponse } from '../types/park';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3333/api/parks', // Replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // optional: specify request timeout in milliseconds
});

export async function createPark(data: ParkData): Promise<AxiosResponse<ParkResponse>> {

  try {
    const response: AxiosResponse<ParkResponse> = await axiosClient.post('/createPark', data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllParks(): Promise<AxiosResponse<ParkResponse[]>> {
  try {
    const response: AxiosResponse<ParkResponse[]> = await axiosClient.get(`/getAllParks`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getParkById(id: number): Promise<AxiosResponse<ParkResponse>> {
  try {
    const response: AxiosResponse<ParkResponse> = await axiosClient.get(`/getParkById/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updatePark(id: number, data: Partial<ParkResponse>): Promise<AxiosResponse<ParkResponse>> {
  try {
    const response: AxiosResponse<ParkResponse> = await axiosClient.put(`/updatePark/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}