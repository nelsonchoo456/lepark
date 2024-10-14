import axios, { AxiosResponse } from 'axios';
import { SensorReadingData, SensorReadingResponse } from '../types/sensorreading';
import client from './client';
import { SensorTypeEnum } from '@prisma/client';

const URL = '/sensorreadings';

// Sensor Reading CRUD operations
export async function createSensorReading(data: SensorReadingData): Promise<AxiosResponse<SensorReadingResponse>> {
  try {
    const response: AxiosResponse<SensorReadingResponse> = await client.post(`${URL}/createSensorReading`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
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
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
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
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

// Sensor-specific functions
export async function getSensorReadingsBySensorId(sensorId: string): Promise<AxiosResponse<SensorReadingResponse[]>> {
  try {
    const response: AxiosResponse<SensorReadingResponse[]> = await client.get(`${URL}/getSensorReadingsBySensorId/${sensorId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getSensorReadingsBySensorIds(sensorIds: string[]): Promise<AxiosResponse<SensorReadingResponse[]>> {
  try {
    const response: AxiosResponse<SensorReadingResponse[]> = await client.get(`${URL}/getSensorReadingsBySensorIds`, {
      params: { sensorIds },
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getSensorReadingsHoursAgo(sensorId: string, hours: number): Promise<AxiosResponse<SensorReadingResponse[]>> {
  try {
    const response: AxiosResponse<SensorReadingResponse[]> = await client.get(`${URL}/getSensorReadingsHoursAgo/${sensorId}/${hours}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAverageSensorReadingsForHoursAgo(sensorId: string, hours: number): Promise<AxiosResponse<number>> {
  try {
    const response: AxiosResponse<number> = await client.get(`${URL}/getAverageSensorReadingsForHoursAgo/${sensorId}/${hours}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getSensorReadingsByDateRange(
  sensorId: string,
  startDate: Date,
  endDate: Date,
): Promise<AxiosResponse<SensorReadingResponse[]>> {
  try {
    const response: AxiosResponse<SensorReadingResponse[]> = await client.get(`${URL}/getSensorReadingsByDateRange/${sensorId}`, {
      params: { startDate, endDate },
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getLatestSensorReadingBySensorId(sensorId: string): Promise<AxiosResponse<SensorReadingResponse | null>> {
  try {
    const response: AxiosResponse<SensorReadingResponse | null> = await client.get(`${URL}/getLatestSensorReadingBySensorId/${sensorId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getSensorReadingTrendWithSlope(sensorId: string, hours: number): Promise<AxiosResponse<string>> {
  try {
    const response: AxiosResponse<string> = await client.get(`${URL}/getSensorReadingTrendWithSlope/${sensorId}/${hours}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

// Hub-specific functions
export async function getAllSensorReadingsByHubIdAndSensorType(
  hubId: string,
  sensorType: SensorTypeEnum,
): Promise<AxiosResponse<SensorReadingResponse[]>> {
  try {
    const response: AxiosResponse<SensorReadingResponse[]> = await client.get(
      `${URL}/getAllSensorReadingsByHubIdAndSensorType/${hubId}/${sensorType}`,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getSensorReadingsByHubIdAndSensorTypeForHoursAgo(
  hubId: string,
  sensorType: SensorTypeEnum,
  hours: number,
): Promise<AxiosResponse<SensorReadingResponse[]>> {
  try {
    const response: AxiosResponse<SensorReadingResponse[]> = await client.get(
      `${URL}/getSensorReadingsByHubIdAndSensorTypeForHoursAgo/${hubId}/${sensorType}/${hours}`,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAverageSensorReadingsForHubIdAndSensorTypeForHoursAgo(
  hubId: string,
  sensorType: SensorTypeEnum,
  hours: number,
): Promise<AxiosResponse<number>> {
  try {
    const response: AxiosResponse<number> = await client.get(
      `${URL}/getAverageSensorReadingsForHubIdAndSensorTypeForHoursAgo/${hubId}/${sensorType}/${hours}`,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getSensorReadingsByHubIdAndSensorTypeByDateRange(
  hubId: string,
  sensorType: SensorTypeEnum,
  startDate: Date,
  endDate: Date,
): Promise<AxiosResponse<SensorReadingResponse[]>> {
  try {
    const response: AxiosResponse<SensorReadingResponse[]> = await client.get(
      `${URL}/getSensorReadingsByHubIdAndSensorTypeByDateRange/${hubId}/${sensorType}`,
      { params: { startDate, endDate } },
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getLatestSensorReadingByHubIdAndSensorType(
  hubId: string,
  sensorType: SensorTypeEnum,
): Promise<AxiosResponse<SensorReadingResponse | null>> {
  try {
    const response: AxiosResponse<SensorReadingResponse | null> = await client.get(
      `${URL}/getLatestSensorReadingByHubIdAndSensorType/${hubId}/${sensorType}`,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

// Zone-specific functions
export async function getAllSensorReadingsByZoneIdAndSensorType(
  zoneId: number,
  sensorType: SensorTypeEnum,
): Promise<AxiosResponse<SensorReadingResponse[]>> {
  try {
    const response: AxiosResponse<SensorReadingResponse[]> = await client.get(
      `${URL}/getAllSensorReadingsByZoneIdAndSensorType/${zoneId}/${sensorType}`,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getSensorReadingsByZoneIdAndSensorTypeForHoursAgo(
  zoneId: number,
  sensorType: SensorTypeEnum,
  hours: number,
): Promise<AxiosResponse<SensorReadingResponse[]>> {
  try {
    const response: AxiosResponse<SensorReadingResponse[]> = await client.get(
      `${URL}/getSensorReadingsByZoneIdAndSensorTypeForHoursAgo/${zoneId}/${sensorType}/${hours}`,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAverageSensorReadingsForZoneIdAndSensorTypeForHoursAgo(
  zoneId: number,
  sensorType: SensorTypeEnum,
  hours: number,
): Promise<AxiosResponse<number>> {
  try {
    const response: AxiosResponse<number> = await client.get(
      `${URL}/getAverageSensorReadingsForZoneIdAndSensorTypeForHoursAgo/${zoneId}/${sensorType}/${hours}`,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAverageReadingsForZoneIdAcrossAllSensorTypesForHoursAgo(
  zoneId: number,
  hours: number,
): Promise<AxiosResponse<{ [sensorType: string]: number }>> {
  try {
    const response: AxiosResponse<{ [sensorType: string]: number }> = await client.get(
      `${URL}/getAverageReadingsForZoneIdAcrossAllSensorTypesForHoursAgo/${zoneId}/${hours}`,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAverageDifferenceBetweenPeriodsBySensorType(
  zoneId: number,
  duration: number,
): Promise<AxiosResponse<{ [sensorType in SensorTypeEnum]: { firstPeriodAvg: number; secondPeriodAvg: number; difference: number } }>> {
  try {
    const response: AxiosResponse<{
      [sensorType in SensorTypeEnum]: { firstPeriodAvg: number; secondPeriodAvg: number; difference: number };
    }> = await client.get(`${URL}/getAverageDifferenceBetweenPeriodsBySensorType/${zoneId}/${duration}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getSensorReadingsByZoneIdAndSensorTypeByDateRange(
  zoneId: number,
  sensorType: SensorTypeEnum,
  startDate: Date,
  endDate: Date,
): Promise<AxiosResponse<SensorReadingResponse[]>> {
  try {
    const response: AxiosResponse<SensorReadingResponse[]> = await client.get(
      `${URL}/getSensorReadingsByZoneIdAndSensorTypeByDateRange/${zoneId}/${sensorType}`,
      { params: { startDate, endDate } },
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getLatestSensorReadingByZoneIdAndSensorType(
  zoneId: number,
  sensorType: SensorTypeEnum,
): Promise<AxiosResponse<SensorReadingResponse | null>> {
  try {
    const response: AxiosResponse<SensorReadingResponse | null> = await client.get(
      `${URL}/getLatestSensorReadingByZoneIdAndSensorType/${zoneId}/${sensorType}`,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getZoneTrendForSensorType(
  zoneId: number, 
  sensorType: SensorTypeEnum, 
  hours: number
): Promise<AxiosResponse<{
  trendDescription: string;
  averageRateOfChange: string;
  averagePercentageChange: string;
  overallChange: string;
  readingsCount: number;
  unit: string;
}>> {
  try {
    const response = await client.get(`${URL}/getZoneTrendForSensorType/${zoneId}/${sensorType}/${hours}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getActiveZoneSensorCount(zoneId: number, hoursAgo = 1): Promise<AxiosResponse<any>> {
  try {
    const response: AxiosResponse<any> = await client.get(`${URL}/getActiveZoneSensorCount/${zoneId}/${hoursAgo}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getUnhealthyOccurrences(zoneId: number): Promise<AxiosResponse<any>> {
  try {
    const response: AxiosResponse<any> = await client.get(`${URL}/getUnhealthyOccurrences/${zoneId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}
