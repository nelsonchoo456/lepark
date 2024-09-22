import axios, { AxiosResponse } from 'axios';
import { SensorData, SensorResponse, SensorUpdateData } from '../types/sensor';
import client from './client';
import { MaintenanceHistoryResponse } from '../types/maintenancehistory';

const URL = '/sensors';

export async function createSensor(data: SensorData, files?: File[]): Promise<AxiosResponse<SensorResponse>> {
  try {
    if (files && files.length > 0) {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append('files', file);
      });

      const uploadedUrls = await client.post(`${URL}/upload`, formData);
      data.image = uploadedUrls.data.uploadedUrls[0]; // Assuming only one image for sensors
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
  data: SensorUpdateData,
  files?: File[],
): Promise<AxiosResponse<SensorResponse>> {
  try {
    if (files && files.length > 0) {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append('files', file);
      });

      const uploadedUrls = await client.post(`${URL}/upload`, formData);
      data.image = uploadedUrls.data.uploadedUrls[0]; // Assuming only one image for sensors
    }

    const response: AxiosResponse<SensorResponse> = await client.put(`${URL}/updateSensor/${id}`, data);
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

export async function getSensorsNeedingCalibration(): Promise<AxiosResponse<SensorResponse[]>> {
  try {
    const response: AxiosResponse<SensorResponse[]> = await client.get(`${URL}/getSensorsNeedingCalibration`);
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

export async function getCalibrationHistoryBySensorId(sensorId: string): Promise<AxiosResponse<MaintenanceHistoryResponse[]>> {
  try {
    const response: AxiosResponse<MaintenanceHistoryResponse[]> = await client.get(`${URL}/getCalibrationHistory/${sensorId}`);
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
