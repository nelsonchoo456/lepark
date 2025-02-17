import { Attraction } from '@prisma/client';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { AttractionResponse, AttractionTicketListingResponse, CreateAttractionData, CreateAttractionTicketListingData, UpdateAttractionData, UpdateAttractionTicketListingData } from '../types/attraction';
import client from './client';

const URL = '/attractions';

export async function createAttraction(data: CreateAttractionData, files?: File[]): Promise<AxiosResponse<AttractionResponse>> {
  try {
    const formData = new FormData();
    files?.forEach((file) => {
      formData.append('files', file); // The key 'files' matches what Multer expects
    });

    const uploadedUrls = await client.post(`${URL}/upload`, formData);
    data.images = uploadedUrls.data.uploadedUrls;

    const response: AxiosResponse<AttractionResponse> = await client.post(`${URL}/createAttraction`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function checkAttractionNameExists(parkId: number, title: string): Promise<AxiosResponse<{ exists: boolean }>> {
  try {
    const response: AxiosResponse<{ exists: boolean }> = await client.get(`${URL}/checkAttractionNameExists`, { params: { parkId, title } });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getAllAttractions(): Promise<AxiosResponse<AttractionResponse[]>> {
  try {
    const response: AxiosResponse<AttractionResponse[]> = await client.get(`${URL}/getAllAttractions`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getAttractionsByParkId(parkId: number): Promise<AxiosResponse<AttractionResponse[]>> {
  try {
    const response: AxiosResponse<AttractionResponse[]> = await client.get(`${URL}/getAttractionsByParkId/${parkId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getAttractionById(id: string): Promise<AxiosResponse<AttractionResponse>> {
  try {
    const response: AxiosResponse<AttractionResponse> = await client.get(`${URL}/viewAttractionDetails/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateAttractionDetails(id: string, updateData: UpdateAttractionData, files?: File[]): Promise<AxiosResponse<AttractionResponse>> {
  try {
    const formData = new FormData();
    files?.forEach((file) => {
      formData.append('files', file); // The key 'files' matches what Multer expects
    });

    const uploadedUrls = await client.post(`${URL}/upload`, formData);
    updateData.images?.push(...uploadedUrls.data.uploadedUrls);
    
    const response: AxiosResponse<AttractionResponse> = await client.put(`${URL}/updateAttractionDetails/${id}`, updateData);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteAttraction(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteAttraction/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function createAttractionTicketListing(data: CreateAttractionTicketListingData): Promise<AxiosResponse<AttractionTicketListingResponse>> {
  try {
    const response: AxiosResponse<AttractionTicketListingResponse> = await client.post(`${URL}/createAttractionTicketListing`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllAttractionTicketListings(): Promise<AxiosResponse<AttractionTicketListingResponse[]>> {
  try {
    const response: AxiosResponse<AttractionTicketListingResponse[]> = await client.get(`${URL}/getAllAttractionTicketListings`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getAttractionTicketListingsByAttractionId(attractionId: string): Promise<AxiosResponse<AttractionTicketListingResponse[]>> {
  try {
    const response: AxiosResponse<AttractionTicketListingResponse[]> = await client.get(`${URL}/getAttractionTicketListingsByAttractionId/${attractionId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getAttractionTicketListingById(id: string): Promise<AxiosResponse<AttractionTicketListingResponse>> {
  try {
    const response: AxiosResponse<AttractionTicketListingResponse> = await client.get(`${URL}/getAttractionTicketListingById/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateAttractionTicketListingDetails(id: string, updateData: UpdateAttractionTicketListingData): Promise<AxiosResponse<AttractionTicketListingResponse>> {
  try {
    const response: AxiosResponse<AttractionTicketListingResponse> = await client.put(`${URL}/updateAttractionTicketListingDetails/${id}`, updateData);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteAttractionTicketListing(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteAttractionTicketListing/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}