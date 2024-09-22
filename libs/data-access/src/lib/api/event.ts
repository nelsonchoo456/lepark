import { Attraction } from '@prisma/client';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { AttractionResponse, CreateAttractionData, UpdateAttractionData } from '../types/attraction';
import client from './client';
import { CreateEventData, EventResponse, UpdateEventData } from '../types/event';

const URL = '/events';

export async function createEvent(data: CreateEventData, files?: File[]): Promise<AxiosResponse<EventResponse>> {
  try {
    const formData = new FormData();

    files?.forEach((file) => {
      formData.append('files', file); // The key 'files' matches what Multer expects
    });

    const uploadedUrls = await client.post(`${URL}/upload`, formData);
    data.images = uploadedUrls.data.uploadedUrls;

    const response: AxiosResponse<EventResponse> = await client.post(`${URL}/createEvent`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllEvents(): Promise<AxiosResponse<EventResponse[]>> {
  try {
    const response: AxiosResponse<EventResponse[]> = await client.get(`${URL}/getAllEvents`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getEventsByFacilityId(facilityId: string): Promise<AxiosResponse<EventResponse[]>> {
  try {
    const response: AxiosResponse<EventResponse[]> = await client.get(`${URL}/getEventsByFacilityId/${facilityId}`);

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getEventsByParkId(parkId: number): Promise<AxiosResponse<EventResponse[]>> {
  try {
    const response: AxiosResponse<EventResponse[]> = await client.get(`${URL}/getEventsByParkId/${parkId}`);

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getEventById(id: string): Promise<AxiosResponse<EventResponse>> {
  try {
    const response: AxiosResponse<EventResponse> = await client.get(`${URL}/getEventById/${id}`);

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateEventDetails(id: string, updateData: UpdateEventData, files?: File[]): Promise<AxiosResponse<EventResponse>> {
  try {
    const formData = new FormData();

    files?.forEach((file) => {
      formData.append('files', file); // The key 'files' matches what Multer expects
    });

    const uploadedUrls = await client.post(`${URL}/upload`, formData);
    updateData.images?.push(...uploadedUrls.data.uploadedUrls);
    
    const response: AxiosResponse<EventResponse> = await client.put(`${URL}/updateEventDetails/${id}`, updateData);
    return response;
  } catch (error) {

    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteEvent(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteEvent/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}
