import axios, { AxiosResponse } from 'axios';
import {
  RegisterVisitorData,
  VisitorResponse,
  VisitorLoginData,
  VisitorLogoutResponse,
  VisitorUpdateData,
  VisitorPasswordResetRequestData,
  VisitorPasswordResetData,
  FavoriteSpeciesRequestData,
  GetFavoriteSpeciesRequestData,
  GetFavoriteSpeciesResponseData,
} from '../types/visitor';
import client from './client';

const URL = '/visitors';

export async function registerVisitor(data: RegisterVisitorData): Promise<AxiosResponse<VisitorResponse>> {
  try {
    const response: AxiosResponse<VisitorResponse> = await client.post(`${URL}/register`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllVisitors(): Promise<AxiosResponse<VisitorResponse[]>> {
  try {
    const response: AxiosResponse<VisitorResponse[]> = await client.get(`${URL}/getAllVisitors`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function viewVisitorDetails(id: string): Promise<AxiosResponse<VisitorResponse>> {
  try {
    const response: AxiosResponse<VisitorResponse> = await client.get(`${URL}/viewVisitorDetails/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateVisitorDetails(id: string, data: VisitorUpdateData): Promise<AxiosResponse<VisitorResponse>> {
  try {
    const response: AxiosResponse<VisitorResponse> = await client.put(`${URL}/updateVisitorDetails/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function loginVisitor(data: VisitorLoginData): Promise<AxiosResponse<VisitorResponse>> {
  try {
    const response: AxiosResponse<VisitorResponse> = await client.post(`${URL}/login`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function logoutVisitor(): Promise<AxiosResponse<VisitorLogoutResponse>> {
  return client.post(`${URL}/logout`);
}

export async function forgotVisitorPassword(data: VisitorPasswordResetRequestData): Promise<AxiosResponse<{ message: string }>> {
  try {
    const response: AxiosResponse<{ message: string }> = await client.post(`${URL}/forgot-password`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

// Reset Password
export async function resetVisitorPassword(data: VisitorPasswordResetData): Promise<AxiosResponse<{ message: string }>> {
  try {
    const response: AxiosResponse<{ message: string }> = await client.post(`${URL}/reset-password`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function fetchVisitor(): Promise<AxiosResponse<VisitorResponse>> {
  return client.get(`${URL}/check-auth`);
}

export async function addFavoriteSpecies(data: FavoriteSpeciesRequestData): Promise<AxiosResponse<VisitorResponse>> {
  try {
    const response: AxiosResponse<VisitorResponse> = await client.post(`${URL}/addFavoriteSpecies`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getFavoriteSpecies(visitorId: string): Promise<AxiosResponse<GetFavoriteSpeciesResponseData>> {
  try {
    const response: AxiosResponse<GetFavoriteSpeciesResponseData> = await client.get(`${URL}/viewFavoriteSpecies/${visitorId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function deleteSpeciesFromFavorites(visitorId: string, speciesId: string): Promise<AxiosResponse<VisitorResponse>> {
  try {
    const response: AxiosResponse<VisitorResponse> = await client.delete(`${URL}/deleteSpeciesFromFavorites/${visitorId}/${speciesId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}