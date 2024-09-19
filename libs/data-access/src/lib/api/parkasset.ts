import axios, { AxiosResponse } from 'axios';
import { ParkAssetData, ParkAssetResponse, ParkAssetUpdateData } from '../types/parkasset';
import client from './client';
import { MaintenanceHistoryResponse } from '../types/maintenancehistory';

const URL = '/parkassets';

export async function createParkAsset(data: ParkAssetData, files?: File[]): Promise<AxiosResponse<ParkAssetResponse>> {
  try {
    if (files && files.length > 0) {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append('files', file);
      });

      const uploadedUrls = await client.post(`${URL}/upload`, formData);
      data.images = uploadedUrls.data.uploadedUrls;
    }

    const response: AxiosResponse<ParkAssetResponse> = await client.post(`${URL}/createParkAsset`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllParkAssets(): Promise<AxiosResponse<ParkAssetResponse[]>> {
  try {
    const response: AxiosResponse<ParkAssetResponse[]> = await client.get(`${URL}/getAllParkAssets`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getParkAssetById(id: string): Promise<AxiosResponse<ParkAssetResponse>> {
  try {
    const response: AxiosResponse<ParkAssetResponse> = await client.get(`${URL}/viewParkAssetDetails/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateParkAssetDetails(
  id: string,
  data: ParkAssetUpdateData,
  files?: File[],
): Promise<AxiosResponse<ParkAssetResponse>> {
  try {
    if (files && files.length > 0) {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append('files', file);
      });

      const uploadedUrls = await client.post(`${URL}/upload`, formData);
      data.images = data.images || [];
      data.images.push(...uploadedUrls.data.uploadedUrls);
    }

    const response: AxiosResponse<ParkAssetResponse> = await client.put(`${URL}/updateParkAssetDetails/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteParkAsset(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteParkAsset/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getParkAssetsNeedingMaintenance(): Promise<AxiosResponse<ParkAssetResponse[]>> {
  try {
    const response: AxiosResponse<ParkAssetResponse[]> = await client.get(`${URL}/getParkAssetsNeedingMaintenance`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateParkAssetStatus(id: string, newStatus: string): Promise<AxiosResponse<ParkAssetResponse>> {
  try {
    const response: AxiosResponse<ParkAssetResponse> = await client.put(`${URL}/updateParkAssetStatus/${id}`, { newStatus });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getMaintenanceHistoryByParkAssetId(parkAssetId: string): Promise<AxiosResponse<MaintenanceHistoryResponse[]>> {
  try {
    const response: AxiosResponse<MaintenanceHistoryResponse[]> = await client.get(`${URL}/getMaintenanceHistory/${parkAssetId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}
