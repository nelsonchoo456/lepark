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
  GetFavoriteSpeciesResponse,
  VerifyVisitorData,
  DeleteVisitorRequestData,
  DeleteVisitorResponse,
} from '../types/visitor';
import client from './client';
import { SpeciesResponse } from '../types/species';

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

export async function resendVerificationEmail(token: string): Promise<AxiosResponse<{ message: string } | { error: string }>> {
  try {
    const response: AxiosResponse<{ message: string } | { error: string }> = await client.post(`${URL}/resend-verification-email`, {
      token,
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

export async function sendVerificationEmailWithEmail(email: string, id: string): Promise<AxiosResponse<{ message: string } | { error: string }>> {
  try {
    const response: AxiosResponse<{ message: string } | { error: string }> = await client.post(`${URL}/send-verification-email-with-email`, { email, id });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function verifyVisitor(data: VerifyVisitorData): Promise<AxiosResponse<VisitorResponse>> {
  try {
    const response: AxiosResponse<VisitorResponse> = await client.post(`${URL}/verify-user`, data);
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

// export async function getFavoriteSpecies(visitorId: string): Promise<AxiosResponse<GetFavoriteSpeciesResponse>> {
export async function getFavoriteSpecies(visitorId: string): Promise<AxiosResponse<SpeciesResponse[]>> {
  try {
    const response: AxiosResponse<SpeciesResponse[]> = await client.get(`${URL}/viewFavoriteSpecies/${visitorId}`);
    console.log(response);
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

export async function isSpeciesInFavorites(visitorId: string, speciesId: string): Promise<boolean> {
  try {
    const response: AxiosResponse<{ isFavorite: boolean }> = await client.get(`${URL}/isSpeciesInFavorites/${visitorId}/${speciesId}`);
    return response.data.isFavorite;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function deleteVisitor(data: DeleteVisitorRequestData): Promise<DeleteVisitorResponse> {
  try {
    return await client.delete(`${URL}/delete`, { data });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}
