import axios, { AxiosResponse } from 'axios';
import {
  AverageCompletionTimeData,
  CompletionRateData,
  OverdueRateData,
  ParkStaffAverageCompletionTimeForPastMonthsData,
  ParkStaffCompletionRatesForPastMonthsData,
  ParkStaffOverdueRatesForPastMonthsData,
  ParkStaffTasksCompletedForPastMonthsData,
  ParkTaskCompletedData,
  PlantTaskData,
  PlantTaskResponse,
  PlantTaskUpdateData,
  StaffPerformanceRankingData,
  TaskLoadPercentageData,
} from '../types/plantTask';
import client from './client';
import { PlantTaskStatusEnum } from '@prisma/client';
import { StaffResponse } from '../types/staff';

const URL = '/planttasks';

export async function createPlantTask(data: PlantTaskData, staffId: string, files?: File[]): Promise<AxiosResponse<PlantTaskResponse>> {
  try {
    const formData = new FormData();

    files?.forEach((file) => {
      formData.append('files', file); // The key 'files' matches what Multer expects
    });

    const uploadedUrls = await client.post(`${URL}/upload`, formData);
    data.images = uploadedUrls.data.uploadedUrls;

    console.log(data.images);
    const response: AxiosResponse<PlantTaskResponse> = await client.post(`${URL}/createPlantTask`, { ...data, submittingStaffId: staffId });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllPlantTasks(): Promise<AxiosResponse<PlantTaskResponse[]>> {
  try {
    const response: AxiosResponse<PlantTaskResponse[]> = await client.get(`${URL}/getAllPlantTasks`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getPlantTaskById(id: string): Promise<AxiosResponse<PlantTaskResponse>> {
  try {
    const response: AxiosResponse<PlantTaskResponse> = await client.get(`${URL}/viewPlantTaskDetails/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getAllAssignedPlantTasks(staffId: string): Promise<AxiosResponse<PlantTaskResponse[]>> {
  try {
    const response: AxiosResponse<PlantTaskResponse[]> = await client.get(`${URL}/getAllAssignedPlantTasks/${staffId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getPlantTasksBySubmittingStaff(staffId: string): Promise<AxiosResponse<PlantTaskResponse[]>> {
  try {
    const response: AxiosResponse<PlantTaskResponse[]> = await client.get(`${URL}/getPlantTasksBySubmittingStaff/${staffId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updatePlantTaskStatus(id: string, newStatus: PlantTaskStatusEnum): Promise<AxiosResponse<PlantTaskResponse>> {
  try {
    const response: AxiosResponse<PlantTaskResponse> = await client.put(`${URL}/updatePlantTaskStatus/${id}`, { newStatus });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updatePlantTaskPosition(id: string, newPosition: number): Promise<AxiosResponse<PlantTaskResponse>> {
  try {
    const response: AxiosResponse<PlantTaskResponse> = await client.put(`${URL}/updatePlantTaskPosition/${id}`, { newPosition });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updatePlantTaskDetails(
  id: string,
  data: PlantTaskUpdateData,
  files?: File[],
): Promise<AxiosResponse<PlantTaskResponse>> {
  try {
    if (files && files.length > 0) {
      const formData = new FormData();

      files?.forEach((file) => {
        formData.append('files', file); // The key 'files' matches what Multer expects
      });

      const uploadedUrls = await client.post(`${URL}/upload`, formData);
      data.images?.push(...uploadedUrls.data.uploadedUrls);
    }

    const response: AxiosResponse<PlantTaskResponse> = await client.put(`${URL}/updatePlantTaskDetails/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deletePlantTask(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deletePlantTask/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteManyPlantTasks(taskStatus?: PlantTaskStatusEnum): Promise<AxiosResponse<void>> {
  try {
    const params: Record<string, any> = {};
    if (taskStatus !== undefined) {
      params.taskStatus = taskStatus; // Add `archived` to the query if defined
    }
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteMany`, { params });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getPlantTasksByParkId(parkId: number): Promise<AxiosResponse<PlantTaskResponse[]>> {
  try {
    const response: AxiosResponse<PlantTaskResponse[]> = await client.get(`${URL}/getAllPlantTasksByParkId/${parkId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function assignPlantTask(id: string, assignerStaffId: string, staffId: string): Promise<AxiosResponse<PlantTaskResponse>> {
  try {
    console.log('assignerStaffId', assignerStaffId);
    console.log('staffId', staffId);
    const response: AxiosResponse<PlantTaskResponse> = await client.put(`${URL}/assignPlantTask/${id}`, { assignerStaffId, staffId });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function unassignPlantTask(id: string, unassignerStaffId: string): Promise<AxiosResponse<PlantTaskResponse>> {
  try {
    const response: AxiosResponse<PlantTaskResponse> = await client.put(`${URL}/unassignPlantTask/${id}`, { unassignerStaffId });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getPlantTasksByStatus(status: PlantTaskStatusEnum): Promise<AxiosResponse<PlantTaskResponse[]>> {
  try {
    const response: AxiosResponse<PlantTaskResponse[]> = await client.get(`${URL}/getPlantTasksByStatus/${status}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getParkPlantTaskCompletionRates(
  parkId: number | null,
  startDate: Date,
  endDate: Date,
): Promise<AxiosResponse<CompletionRateData[]>> {
  try {
    const response: AxiosResponse<CompletionRateData[]> = await client.get(`${URL}/getParkPlantTaskCompletionRates`, {
      params: { parkId, startDate, endDate },
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getParkPlantTaskOverdueRates(
  parkId: number | null,
  startDate: Date,
  endDate: Date,
): Promise<AxiosResponse<OverdueRateData[]>> {
  try {
    const response: AxiosResponse<OverdueRateData[]> = await client.get(`${URL}/getParkPlantTaskOverdueRates`, {
      params: { parkId, startDate, endDate },
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getParkAverageTaskCompletionTime(
  parkId: number | null,
  startDate: Date,
  endDate: Date,
): Promise<AxiosResponse<AverageCompletionTimeData[]>> {
  try {
    const response: AxiosResponse<AverageCompletionTimeData[]> = await client.get(`${URL}/getParkAverageTaskCompletionTime`, {
      params: { parkId, startDate, endDate },
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getParkTaskLoadPercentage(parkId: number | null): Promise<AxiosResponse<TaskLoadPercentageData[]>> {
  try {
    const response: AxiosResponse<TaskLoadPercentageData[]> = await client.get(`${URL}/getParkTaskLoadPercentage`, { params: { parkId } });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getStaffPerformanceRanking(
  parkId: number | null,
  startDate: Date,
  endDate: Date,
): Promise<AxiosResponse<StaffPerformanceRankingData>> {
  try {
    const response: AxiosResponse<StaffPerformanceRankingData> = await client.get(`${URL}/getStaffPerformanceRanking`, {
      params: { parkId, startDate, endDate },
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getParkTaskCompleted(
  parkId: number | null,
  startDate: Date,
  endDate: Date,
): Promise<AxiosResponse<ParkTaskCompletedData[]>> {
  try {
    const response: AxiosResponse<ParkTaskCompletedData[]> = await client.get(`${URL}/getParkTaskCompleted`, {
      params: { parkId, startDate, endDate },
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getParkStaffAverageCompletionTimeForPastMonths(
  parkId: number | null,
  months: number,
): Promise<AxiosResponse<ParkStaffAverageCompletionTimeForPastMonthsData[]>> {
  try {
    const response: AxiosResponse<ParkStaffAverageCompletionTimeForPastMonthsData[]> = await client.get(
      `${URL}/getParkStaffAverageCompletionTimeForPastMonths`,
      { params: { parkId, months } },
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

export async function getParkStaffCompletionRatesForPastMonths(
  parkId: number | null,
  months: number,
): Promise<AxiosResponse<ParkStaffCompletionRatesForPastMonthsData[]>> {
  try {
    const response: AxiosResponse<ParkStaffCompletionRatesForPastMonthsData[]> = await client.get(
      `${URL}/getParkStaffCompletionRatesForPastMonths`,
      { params: { parkId, months } },
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

export async function getParkStaffOverdueRatesForPastMonths(
  parkId: number | null,
  months: number,
): Promise<AxiosResponse<ParkStaffOverdueRatesForPastMonthsData[]>> {
  try {
    const response: AxiosResponse<ParkStaffOverdueRatesForPastMonthsData[]> = await client.get(
      `${URL}/getParkStaffOverdueRatesForPastMonths`,
      { params: { parkId, months } },
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

export async function getParkStaffTasksCompletedForPastMonths(
  parkId: number | null,
  months: number,
): Promise<AxiosResponse<ParkStaffTasksCompletedForPastMonthsData[]>> {
  try {
    const response: AxiosResponse<ParkStaffTasksCompletedForPastMonthsData[]> = await client.get(
      `${URL}/getParkStaffTasksCompletedForPastMonths`,
      { params: { parkId, months } },
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
