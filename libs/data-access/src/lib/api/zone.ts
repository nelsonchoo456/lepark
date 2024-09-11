import axios, { AxiosResponse } from 'axios';
import { ZoneData, ZoneResponse } from '../types/zone';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3333/api/zones', // Replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // optional: specify request timeout in milliseconds
});

export async function createZone(data: ZoneData): Promise<AxiosResponse<ZoneResponse>> {

  try {
    const response: AxiosResponse<ZoneResponse> = await axiosClient.post('/createZone', data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllZones(): Promise<AxiosResponse<ZoneResponse[]>> {
  try {
    const response: AxiosResponse<ZoneResponse[]> = await axiosClient.get(`/getAllZones`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getZoneById(id: number): Promise<AxiosResponse<ZoneResponse>> {
  try {
    const response: AxiosResponse<ZoneResponse> = await axiosClient.get(`/getZoneById/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

// export async function updatePark(id: number, data: Partial<ParkResponse>): Promise<AxiosResponse<ParkResponse>> {
//   try {
//     const response: AxiosResponse<ParkResponse> = await axiosClient.put(`/updatePark/${id}`, data);
//     return response;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       throw error.response?.data.error || error.message;
//     } else {
//       throw error;
//     }
//   }
// }