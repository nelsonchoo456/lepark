import axios, { AxiosResponse } from 'axios';
import {
  CompletionTimeData,
  MaintenanceTaskData,
  MaintenanceTaskResponse,
  MaintenanceTaskUpdateData,
  OverdueRateMaintenanceTaskData,
  DelayedTaskTypeData,
  ParkTaskTypeAverageCompletionTimesForPastMonthsData,
  ParkTaskTypeOverdueRatesForPastMonthsData,
} from '../types/maintenanceTask';
import client from './client';
import { MaintenanceTaskStatusEnum } from '@prisma/client';

const URL = '/maintenancetasks';

export async function createMaintenanceTask(
  data: MaintenanceTaskData,
  staffId: string,
  files?: File[],
): Promise<AxiosResponse<MaintenanceTaskResponse>> {
  try {
    const formData = new FormData();

    files?.forEach((file) => {
      formData.append('files', file);
    });

    const uploadedUrls = await client.post(`${URL}/upload`, formData);
    data.images = uploadedUrls.data.uploadedUrls;

    const response: AxiosResponse<MaintenanceTaskResponse> = await client.post(`${URL}/createMaintenanceTask`, {
      ...data,
      submittingStaffId: staffId,
    });
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

export async function updateMaintenanceTaskStatus(
  id: string,
  newStatus: MaintenanceTaskStatusEnum,
  staffId?: string,
): Promise<AxiosResponse<MaintenanceTaskResponse>> {
  try {
    const response: AxiosResponse<MaintenanceTaskResponse> = await client.put(`${URL}/updateMaintenanceTaskStatus/${id}`, {
      newStatus,
      staffId,
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

export async function updateMaintenanceTaskPosition(id: string, newPosition: number): Promise<AxiosResponse<MaintenanceTaskResponse>> {
  try {
    const response: AxiosResponse<MaintenanceTaskResponse> = await client.put(`${URL}/updateMaintenanceTaskPosition/${id}`, {
      newPosition,
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
    const response: AxiosResponse<MaintenanceTaskResponse> = await client.put(`${URL}/unassignMaintenanceTask/${id}`, {
      unassignerStaffId,
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

export async function getParkMaintenanceTaskAverageCompletionTimeForPeriod(
  parkId: number | null,
  startDate: Date,
  endDate: Date,
): Promise<AxiosResponse<CompletionTimeData[]>> {
  try {
    const response: AxiosResponse<CompletionTimeData[]> = await client.get(`${URL}/getParkMaintenanceTaskAverageCompletionTimeForPeriod`, {
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

export async function getParkMaintenanceTaskOverdueRateForPeriod(
  parkId: number | null,
  startDate: Date,
  endDate: Date,
): Promise<AxiosResponse<OverdueRateMaintenanceTaskData[]>> {
  try {
    const response: AxiosResponse<OverdueRateMaintenanceTaskData[]> = await client.get(
      `${URL}/getParkMaintenanceTaskOverdueRateForPeriod`,
      { params: { parkId, startDate, endDate } },
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

export async function getParkMaintenanceTaskDelayedTaskTypesForPeriod(
  parkId: number | null,
  startDate: Date,
  endDate: Date,
): Promise<AxiosResponse<DelayedTaskTypeData[]>> {
  try {
    const response: AxiosResponse<DelayedTaskTypeData[]> = await client.get(`${URL}/getParkMaintenanceTaskDelayedTaskTypesForPeriod`, {
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

export async function getParkTaskTypeAverageCompletionTimesForPastMonths(
  parkId: number | null,
  months: number,
): Promise<AxiosResponse<ParkTaskTypeAverageCompletionTimesForPastMonthsData[]>> {
  try {
    const response: AxiosResponse<ParkTaskTypeAverageCompletionTimesForPastMonthsData[]> = await client.get(
      `${URL}/getParkTaskTypeAverageCompletionTimesForPastMonths`,
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

export async function getParkTaskTypeOverdueRatesForPastMonths(
  parkId: number | null,
  months: number,
): Promise<AxiosResponse<ParkTaskTypeOverdueRatesForPastMonthsData[]>> {
  try {
    const response: AxiosResponse<ParkTaskTypeOverdueRatesForPastMonthsData[]> = await client.get(
      `${URL}/getParkTaskTypeOverdueRatesForPastMonths`,
      {
        params: { parkId, months },
      },
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
