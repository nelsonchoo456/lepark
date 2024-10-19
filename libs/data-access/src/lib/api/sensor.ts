import axios, { AxiosResponse } from 'axios';
import { SensorData, SensorResponse, SensorUpdateData } from '../types/sensor';
import client from './client';
import { MaintenanceHistoryResponse } from '../types/maintenancehistory';

const URL = '/sensors';

export async function createSensor(data: SensorData, files?: File[]): Promise<AxiosResponse<SensorResponse>> {
  try {
    if (files && files.length > 0) {
      const formData = new FormData();

      // Append files to FormData (using the key 'files' to match Multer)
      files.forEach((file) => {
        formData.append('files', file); // The key 'files' matches what Multer expects
      });

      const uploadedUrls = await client.post(`${URL}/upload`, formData);
      data.images = uploadedUrls.data.uploadedUrls;
    }

    const response: AxiosResponse<SensorResponse> = await client.post(`${URL}/createSensor`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllSensors(facilityId?: string): Promise<AxiosResponse<SensorResponse[]>> {
  try {
    let url = `${URL}/getAllSensors`;
    if (facilityId !== undefined) {
      url += `/${facilityId}`;
    }
    const response: AxiosResponse<SensorResponse[]> = await client.get(url);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getSensorById(id: string): Promise<AxiosResponse<SensorResponse>> {
  try {
    const response: AxiosResponse<SensorResponse> = await client.get(`${URL}/getSensorById/${id}`);
    console.log(response);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getSensorsByHubId(hubId: string): Promise<AxiosResponse<SensorResponse[]>> {
  try {
    const response: AxiosResponse<SensorResponse[]> = await client.get(`${URL}/getSensorsByHubId/${hubId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getPlantSensorsByZoneId(zoneId: number): Promise<AxiosResponse<SensorResponse[]>> {
  try {
    const response: AxiosResponse<SensorResponse[]> = await client.get(`${URL}/getPlantSensorsByZoneId/${zoneId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getSensorsByZoneId(zoneId: number): Promise<AxiosResponse<SensorResponse[]>> {
  try {
    const response: AxiosResponse<SensorResponse[]> = await client.get(`${URL}/getSensorsByZoneId/${zoneId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateSensorDetails(
  id: string,
  data: Partial<SensorResponse>,
  files?: File[],
): Promise<AxiosResponse<SensorResponse>> {
  console.log('id', id);
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
    console.log('data', data);
    const response: AxiosResponse<SensorResponse> = await client.put(`${URL}/updateSensorDetails/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteSensor(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteSensor/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getSensorsNeedingMaintenance(): Promise<AxiosResponse<SensorResponse[]>> {
  try {
    const response: AxiosResponse<SensorResponse[]> = await client.get(`${URL}/getSensorsNeedingMaintenance`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateSensorStatus(id: string, newStatus: string): Promise<AxiosResponse<SensorResponse>> {
  try {
    const response: AxiosResponse<SensorResponse> = await client.put(`${URL}/updateSensorStatus/${id}`, { newStatus });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function addSensorToHub(id: string, data: Partial<SensorResponse>): Promise<AxiosResponse<SensorResponse>> {
  try {
    const response: AxiosResponse<SensorResponse> = await client.put(`${URL}/addSensorToHub/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function removeSensorFromHub(id: string): Promise<AxiosResponse<SensorResponse>> {
  try {
    const response: AxiosResponse<SensorResponse> = await client.put(`${URL}/removeSensorFromHub/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getMaintenanceHistoryBySensorId(sensorId: string): Promise<AxiosResponse<MaintenanceHistoryResponse[]>> {
  try {
    const response: AxiosResponse<MaintenanceHistoryResponse[]> = await client.get(`${URL}/getMaintenanceHistory/${sensorId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getSensorsByParkId(parkId: number): Promise<AxiosResponse<SensorResponse[]>> {
  try {
    const response: AxiosResponse<SensorResponse[]> = await client.get(`${URL}/getSensorsByParkId/${parkId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function checkSensorDuplicateSerialNumber(serialNumber: string, sensorId?: string): Promise<boolean> {
  try {
    const params = new URLSearchParams({ serialNumber });
    if (sensorId) {
      params.append('sensorId', sensorId);
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

export async function getCameraStreamBySensorId(
  sensorId: string,
): Promise<AxiosResponse<{ sensor: SensorResponse; cameraStreamURL: string }>> {
  try {
    const response: AxiosResponse<{ sensor: SensorResponse; cameraStreamURL: string }> = await client.get(
      `${URL}/getCameraStreamBySensorId/${sensorId}`,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getCameraStreamsByZoneId(
  zoneId: number,
): Promise<AxiosResponse<{ sensor: SensorResponse; cameraStreamURL: string }[]>> {
  try {
    const response: AxiosResponse<{ sensor: SensorResponse; cameraStreamURL: string }[]> = await client.get(
      `${URL}/getCameraStreamsByZoneId/${zoneId}`,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}
