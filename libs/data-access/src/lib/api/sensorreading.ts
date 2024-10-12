import axios, { AxiosResponse } from 'axios';
import { SensorReadingData, SensorReadingResponse } from '../types/sensorreading';
import client from './client';

const URL = '/sensorreadings';

export async function createSensorReading(data: SensorReadingData): Promise<AxiosResponse<SensorReadingResponse>> {
  try {
    const response: AxiosResponse<SensorReadingResponse> = await client.post(`${URL}/createSensorReading`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getSensorReadingById(id: string): Promise<AxiosResponse<SensorReadingResponse>> {
  try {
    const response: AxiosResponse<SensorReadingResponse> = await client.get(`${URL}/getSensorReadingById/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getSensorReadingsByHubId(hubId: string): Promise<AxiosResponse<SensorReadingResponse[]>> {
  try {
    const response: AxiosResponse<SensorReadingResponse[]> = await client.get(`${URL}/getSensorReadingsByHubId/${hubId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getSensorReadingsBySensorId(sensorId: string): Promise<AxiosResponse<SensorReadingResponse[]>> {
  try {
    const response: AxiosResponse<SensorReadingResponse[]> = await client.get(`${URL}/getSensorReadingsBySensorId/${sensorId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getSensorReadingsByZoneId(zoneId: number): Promise<AxiosResponse<SensorReadingResponse[]>> {
  try {
    const response: AxiosResponse<SensorReadingResponse[]> = await client.get(`${URL}/getSensorReadingsByZoneId/${zoneId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getSensorReadingsAverageForPastFourHours(sensorId: string): Promise<AxiosResponse<SensorReadingResponse[]>> {
  try {
    const response: AxiosResponse<SensorReadingResponse[]> = await client.get(`${URL}/getSensorReadingsAverageForPastFourHours/${sensorId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateSensorReading(id: string, data: Partial<SensorReadingData>): Promise<AxiosResponse<SensorReadingResponse>> {
  try {
    const response: AxiosResponse<SensorReadingResponse> = await client.put(`${URL}/updateSensorReading/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteSensorReading(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteSensorReading/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}