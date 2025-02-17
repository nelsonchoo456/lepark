import axios, { AxiosResponse } from 'axios';
import { ParkAssetData, ParkAssetResponse, ParkAssetUpdateData } from '../types/parkAsset';
import client from './client';
import { MaintenanceTaskResponse } from '@lepark/data-access';

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

export async function getAllParkAssets(parkId?: number): Promise<AxiosResponse<ParkAssetResponse[]>> {
  try {
    let url = `${URL}/getAllParkAssets`;
    if (parkId !== undefined) {
      url += `/${parkId}`;
    }
    const response: AxiosResponse<ParkAssetResponse[]> = await client.get(url);
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

export async function getParkAssetByIdentifierNumber(identifierNumber: string): Promise<AxiosResponse<ParkAssetResponse>> {
  try {
    const response: AxiosResponse<ParkAssetResponse> = await client.get(`${URL}/getByIdentifierNumber/${identifierNumber}`);
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

export async function getMaintenanceTasksByParkAssetId(parkAssetId: string): Promise<AxiosResponse<MaintenanceTaskResponse[]>> {
  try {
    const response: AxiosResponse<MaintenanceTaskResponse[]> = await client.get(`${URL}/getMaintenanceTasks/${parkAssetId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getParkAssetBySerialNumber(serialNumber: string): Promise<AxiosResponse<ParkAssetResponse>> {
  try {
    const response: AxiosResponse<ParkAssetResponse> = await client.get(`${URL}/getBySerialNumber/${serialNumber}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function checkParkAssetDuplicateSerialNumber(serialNumber: string, parkAssetId?: string): Promise<boolean> {
  try {
    const params = new URLSearchParams({ serialNumber });
    if (parkAssetId) {
      params.append('parkAssetId', parkAssetId);
    }
    const response: AxiosResponse<{ isDuplicate: boolean }> = await client.get(`${URL}/checkDuplicateSerialNumber?${params}`);
    return response.data.isDuplicate;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}
