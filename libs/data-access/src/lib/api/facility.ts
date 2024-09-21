import axios, { AxiosResponse } from 'axios';
import { FacilityResponse, FacilityData } from '../types/facility';
import client from './client';

const URL = '/facilities';

export async function createFacility(data: FacilityData, files?: File[]): Promise<AxiosResponse<FacilityResponse>> {
  try {
    const formData = new FormData();

    files?.forEach((file) => {
      formData.append('files', file);
    });

    const uploadedUrls = await client.post(`${URL}/upload`, formData);
    data.images = uploadedUrls.data.uploadedUrls;

    console.log(data);

    const response: AxiosResponse<FacilityResponse> = await client.post(`${URL}/createFacility`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllFacilities(): Promise<AxiosResponse<FacilityResponse[]>> {
  try {
    const response: AxiosResponse<FacilityResponse[]> = await client.get(`${URL}/getAllFacilities`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getFacilityById(id: string): Promise<AxiosResponse<FacilityResponse>> {
  try {
    const response: AxiosResponse<FacilityResponse> = await client.get(`${URL}/getFacilityById/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateFacilityDetails(
  id: string,
  data: Partial<FacilityData>,
  files?: File[],
): Promise<AxiosResponse<FacilityResponse>> {
  try {
    if (files && files.length > 0) {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append('files', file);
      });

      const uploadedUrls = await client.post(`${URL}/upload`, formData);
      data.images = uploadedUrls.data.uploadedUrls;
    }

    const response: AxiosResponse<FacilityResponse> = await client.put(`${URL}/updateFacilityDetails/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteFacility(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteFacility/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getFacilitiesByParkId(parkId: number): Promise<AxiosResponse<FacilityResponse[]>> {
  try {
    const response: AxiosResponse<FacilityResponse[]> = await client.get(`${URL}/getAllFacilities?parkId=${parkId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}
