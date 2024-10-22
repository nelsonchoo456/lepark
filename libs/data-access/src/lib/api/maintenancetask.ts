import axios, { AxiosResponse } from 'axios';
import { CompletionTimeData, MaintenanceTaskData, MaintenanceTaskResponse, MaintenanceTaskUpdateData, OverdueRateData } from '../types/maintenancetask';
import client from './client';
import { MaintenanceTaskStatusEnum } from '@prisma/client';

const URL = '/maintenancetasks';

export async function createMaintenanceTask(data: MaintenanceTaskData, staffId: string, files?: File[]): Promise<AxiosResponse<MaintenanceTaskResponse>> {
  try {
    const formData = new FormData();

    files?.forEach((file) => {
      formData.append('files', file);
    });

    const uploadedUrls = await client.post(`${URL}/upload`, formData);
    data.images = uploadedUrls.data.uploadedUrls;

    const response: AxiosResponse<MaintenanceTaskResponse> = await client.post(`${URL}/createMaintenanceTask`, { ...data, submittingStaffId: staffId });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllMaintenanceTasks(): Promise<AxiosResponse<MaintenanceTaskResponse[]>> {
  try {
    const response: AxiosResponse<MaintenanceTaskResponse[]> = await client.get(`${URL}/getAllMaintenanceTasks`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getMaintenanceTaskById(id: string): Promise<AxiosResponse<MaintenanceTaskResponse>> {
  try {
    const response: AxiosResponse<MaintenanceTaskResponse> = await client.get(`${URL}/viewMaintenanceTaskDetails/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getAllAssignedMaintenanceTasks(staffId: string): Promise<AxiosResponse<MaintenanceTaskResponse[]>> {
  try {
    const response: AxiosResponse<MaintenanceTaskResponse[]> = await client.get(`${URL}/getAllAssignedMaintenanceTasks/${staffId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getMaintenanceTasksBySubmittingStaff(staffId: string): Promise<AxiosResponse<MaintenanceTaskResponse[]>> {
  try {
    const response: AxiosResponse<MaintenanceTaskResponse[]> = await client.get(`${URL}/getMaintenanceTasksBySubmittingStaff/${staffId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateMaintenanceTaskStatus(id: string, newStatus: MaintenanceTaskStatusEnum, staffId?: string): Promise<AxiosResponse<MaintenanceTaskResponse>> {
  try {
    const response: AxiosResponse<MaintenanceTaskResponse> = await client.put(`${URL}/updateMaintenanceTaskStatus/${id}`, { newStatus, staffId });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateMaintenanceTaskPosition(id: string, newPosition: number): Promise<AxiosResponse<MaintenanceTaskResponse>> {
  try {
    const response: AxiosResponse<MaintenanceTaskResponse> = await client.put(`${URL}/updateMaintenanceTaskPosition/${id}`, { newPosition });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateMaintenanceTaskDetails(
  id: string,
  data: MaintenanceTaskUpdateData,
  files?: File[],
): Promise<AxiosResponse<MaintenanceTaskResponse>> {
  try {
    if (files && files.length > 0) {
      const formData = new FormData();

      files?.forEach((file) => {
        formData.append('files', file);
      });

      const uploadedUrls = await client.post(`${URL}/upload`, formData);
      data.images?.push(...uploadedUrls.data.uploadedUrls);
    }

    const response: AxiosResponse<MaintenanceTaskResponse> = await client.put(`${URL}/updateMaintenanceTaskDetails/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteMaintenanceTask(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteMaintenanceTask/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteMaintenanceTasksByStatus(status: MaintenanceTaskStatusEnum): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteMaintenanceTasksByStatus/${status}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getMaintenanceTasksByParkId(parkId: number): Promise<AxiosResponse<MaintenanceTaskResponse[]>> {
  try {
    const response: AxiosResponse<MaintenanceTaskResponse[]> = await client.get(`${URL}/getMaintenanceTasksByParkId/${parkId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function assignMaintenanceTask(id: string, staffId: string): Promise<AxiosResponse<MaintenanceTaskResponse>> {
  try {
    const response: AxiosResponse<MaintenanceTaskResponse> = await client.put(`${URL}/assignMaintenanceTask/${id}`, { staffId });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function unassignMaintenanceTask(id: string, unassignerStaffId: string): Promise<AxiosResponse<MaintenanceTaskResponse>> {
  try {
    const response: AxiosResponse<MaintenanceTaskResponse> = await client.put(`${URL}/unassignMaintenanceTask/${id}`, { unassignerStaffId });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function completeMaintenanceTask(id: string, staffId: string): Promise<AxiosResponse<MaintenanceTaskResponse>> {
  try {
    const response: AxiosResponse<MaintenanceTaskResponse> = await client.post(`${URL}/completeMaintenanceTask/${id}`, { staffId });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function acceptMaintenanceTask(id: string, staffId: string): Promise<AxiosResponse<MaintenanceTaskResponse>> {
  try {
    const response: AxiosResponse<MaintenanceTaskResponse> = await client.post(`${URL}/acceptMaintenanceTask/${id}`, { staffId });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function unacceptMaintenanceTask(id: string): Promise<AxiosResponse<MaintenanceTaskResponse>> {
  try {
    const response: AxiosResponse<MaintenanceTaskResponse> = await client.post(`${URL}/unacceptMaintenanceTask/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getMaintenanceTasksByStatus(status: MaintenanceTaskStatusEnum): Promise<AxiosResponse<MaintenanceTaskResponse[]>> {
  try {
    const response: AxiosResponse<MaintenanceTaskResponse[]> = await client.get(`${URL}/getMaintenanceTasksByStatus/${status}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getParkMaintenanceTaskAverageCompletionTimeForPeriod(parkId: number, startDate: Date, endDate: Date): Promise<AxiosResponse<number>> {
  try {
    const response: AxiosResponse<CompletionTimeData[]> = await client.get(`${URL}/getParkMaintenanceTaskAverageCompletionTimeForPeriod`, { params: { parkId, startDate, endDate } });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getParkMaintenanceTaskOverdueRateForPeriod(parkId: number, startDate: Date, endDate: Date): Promise<AxiosResponse<number>> {
  try {
    const response: AxiosResponse<OverdueRateData[]> = await client.get(`${URL}/getParkMaintenanceTaskOverdueRateForPeriod`, { params: { parkId, startDate, endDate } });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getParkMaintenanceTaskCriticalTaskTypesForPeriod(parkId: number, startDate: Date, endDate: Date): Promise<AxiosResponse<string[]>> {
  try {
    const response: AxiosResponse<string[]> = await client.get(`${URL}/getParkMaintenanceTaskCriticalTaskTypesForPeriod`, { params: { parkId, startDate, endDate } });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  } 
}

export async function getParkMaintenanceTaskTaskTypeEfficiencyRanking(parkId: number, startDate: Date, endDate: Date): Promise<AxiosResponse<string[]>> {
  try {
    const response: AxiosResponse<string> = await client.get(`${URL}/getParkMaintenanceTaskTaskTypeEfficiencyRanking`, { params: { parkId, startDate, endDate } });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getParkMaintenanceTaskTrendAnalysis(parkId: number, startDate: Date, endDate: Date, previousStartDate: Date, previousEndDate: Date): Promise<AxiosResponse<string[]>> {
  try {
    const response: AxiosResponse<string[]> = await client.get(`${URL}/getParkMaintenanceTaskTrendAnalysis`, { params: { parkId, startDate, endDate, previousStartDate, previousEndDate } });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getParkMaintenanceTaskOverdueRateAnalysis(parkId: number, startDate: Date, endDate: Date): Promise<AxiosResponse<string[]>> {
  try {
    const response: AxiosResponse<string[]> = await client.get(`${URL}/getParkMaintenanceTaskOverdueRateAnalysis`, { params: { parkId, startDate, endDate } });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getParkMaintenanceTaskTaskTypeComparisonAnalysis(parkId: number, startDate: Date, endDate: Date): Promise<AxiosResponse<string[]>> {
  try {
    const response: AxiosResponse<string[]> = await client.get(`${URL}/getParkMaintenanceTaskTaskTypeComparisonAnalysis`, { params: { parkId, startDate, endDate } });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

// Add other functions similar to the plantTask API file, such as getParkTaskLoadPercentage, getStaffPerformanceRanking, etc.
