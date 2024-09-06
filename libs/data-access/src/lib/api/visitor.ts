import axios, { AxiosResponse } from 'axios';
import {
  FavoriteSpeciesRequestData,
  ForgotPasswordRequestData,
  GetFavoriteSpeciesRequestData,
  GetFavoriteSpeciesResponseData,
  LoginRequestData,
  LoginResponseData,
  ResetPasswordRequestData,
  VisitorResponse,
} from '../types/visitor'; // Adjust the import path as necessary
import client from './client';

export async function register(data: VisitorResponse): Promise<AxiosResponse<VisitorResponse>> {
  try {
    const response: AxiosResponse<VisitorResponse> = await client.post('/register', data);
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
    const response: AxiosResponse<VisitorResponse[]> = await client.get('/getAllVisitors');
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getVisitorById(id: string): Promise<AxiosResponse<VisitorResponse>> {
  try {
    const response: AxiosResponse<VisitorResponse> = await client.get(`/viewVisitorDetails/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function updateVisitor(id: string, data: Partial<VisitorResponse>): Promise<AxiosResponse<VisitorResponse>> {
  try {
    const response: AxiosResponse<VisitorResponse> = await client.put(`/updateVisitorDetails/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function login(data: LoginRequestData): Promise<AxiosResponse<LoginResponseData>> {
  try {
    const response: AxiosResponse<LoginResponseData> = await client.post('/login', data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function logout(): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.post('/logout');
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function forgotPassword(data: ForgotPasswordRequestData): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.post('/forgot-password', data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function resetPassword(data: ResetPasswordRequestData): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.post('/reset-password', data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function addFavoriteSpecies(data: FavoriteSpeciesRequestData): Promise<AxiosResponse<VisitorResponse>> {
  try {
    const response: AxiosResponse<VisitorResponse> = await client.post('/addFavoriteSpecies', data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getFavoriteSpecies(data: GetFavoriteSpeciesRequestData): Promise<AxiosResponse<GetFavoriteSpeciesResponseData>> {
  try {
    const response: AxiosResponse<GetFavoriteSpeciesResponseData> = await client.get('/viewFavoriteSpecies', {
      params: data,
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

export async function deleteSpeciesFromFavorites(data: FavoriteSpeciesRequestData): Promise<AxiosResponse<VisitorResponse>> {
  try {
    const response: AxiosResponse<VisitorResponse> = await client.delete('/deleteSpeciesFromFavorites', {
      data,
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
