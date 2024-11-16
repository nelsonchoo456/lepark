import axios, { AxiosResponse } from "axios";
import client from './client';

const URL = '/predictiveirrigation';

export async function getHistoricalSensorsRainfallDataByHub(
  hubId: string,
  startDate: Date,
  endDate: Date,
): Promise<AxiosResponse<any>> {
  try {
    const response: AxiosResponse<any> = await client.get(`${URL}/getHistoricalSensorsRainfallData/${hubId}`, {
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

export async function getHistoricalRainfallDataByHub(
  hubId: string,
  startDate: Date,
  endDate: Date,
): Promise<AxiosResponse<any>> {
  try {
    const response: AxiosResponse<any> = await client.get(`${URL}/getHubHistoricalRainfallData/${hubId}`, {
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

export async function getPredictionForHub(
  hubId: string,
): Promise<AxiosResponse<any>> {
  try {
    const response: AxiosResponse<any> = await client.get(`${URL}/predictionForHub/${hubId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getPredictionsForZone(
  zoneId: number,
): Promise<AxiosResponse<any>> {
  try {
    console.log(zoneId)
    const response: AxiosResponse<any> = await client.get(`${URL}/predictionsForZone/${zoneId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function trainModelForHub(
  hubId: string,
): Promise<AxiosResponse<any>> {
  try {
    const response: AxiosResponse<any> = await client.get(`${URL}/trainModelForHub/${hubId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getModelForHub(
  hubId: string,
): Promise<AxiosResponse<any>> {
  try {
    const response: AxiosResponse<any> = await client.get(`${URL}/getModelForHub/${hubId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}