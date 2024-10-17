import { Attraction } from '@prisma/client';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { AttractionResponse, CreateAttractionData, UpdateAttractionData } from '../types/attraction';
import client from './client';
import { AnnouncementResponse, CreateAnnouncementData, UpdateAnnouncementData } from '../types/announcement';

const URL = '/announcements';

export async function createAnnouncement(data: CreateAnnouncementData): Promise<AxiosResponse<AnnouncementResponse>> {
  try {
    const response: AxiosResponse<AnnouncementResponse> = await client.post(`${URL}/createAnnouncement`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllAnnouncements(): Promise<AxiosResponse<AnnouncementResponse[]>> {
  try {
    const response: AxiosResponse<AnnouncementResponse[]> = await client.get(`${URL}/getAllAnnouncements`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getAnnouncementsByParkId(parkId: number): Promise<AxiosResponse<AnnouncementResponse[]>> {
  try {
    const response: AxiosResponse<AnnouncementResponse[]> = await client.get(`${URL}/getAnnouncementsByParkId/${parkId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getNParksAnnouncements(): Promise<AxiosResponse<AnnouncementResponse[]>> {
  try {
    const response: AxiosResponse<AnnouncementResponse[]> = await client.get(`${URL}/getNParksAnnouncements`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function viewAnnouncementDetails(id: string): Promise<AxiosResponse<AnnouncementResponse>> {
  try {
    const response: AxiosResponse<AnnouncementResponse> = await client.get(`${URL}/viewAnnouncementDetails/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateAnnouncementDetails(id: string, updateData: UpdateAnnouncementData): Promise<AxiosResponse<AnnouncementResponse>> {
  try {
    const response: AxiosResponse<AnnouncementResponse> = await client.put(`${URL}/updateAnnouncementDetails/${id}`, updateData);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteAnnouncement(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteAnnouncement/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}