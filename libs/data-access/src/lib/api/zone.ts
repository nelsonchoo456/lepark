import axios, { AxiosResponse } from 'axios';
import { ZoneData, ZoneResponse } from '../types/zone';
import client from './client';

const URL = '/zones';

// Remove the axiosClient creation

export async function createZone(data: ZoneData): Promise<AxiosResponse<ZoneResponse>> {
  try {
    const response: AxiosResponse<ZoneResponse> = await client.post(`${URL}/createZone`, data);
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
    const response: AxiosResponse<ZoneResponse[]> = await client.get(`${URL}/getAllZones`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getZonesByParkId(parkId: number): Promise<AxiosResponse<ZoneResponse[]>> {
  try {
    const response: AxiosResponse<ZoneResponse[]> = await client.get(`${URL}/getAllZones`, { params: { parkId } });
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
    const response: AxiosResponse<ZoneResponse> = await client.get(`${URL}/getZoneById/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteZone(id: number): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteZone/${id}`);
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