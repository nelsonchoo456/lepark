import axios, { AxiosResponse } from 'axios';
import { Visitor } from '../types/visitor'; // Adjust the import path as necessary
import exp from 'constants';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3333/api/Visitor', // Replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // optional: specify request timeout in milliseconds
});

export async function register(data: Visitor): Promise<AxiosResponse<Visitor>> {
  try {
    const response: AxiosResponse<Visitor> = await axiosClient.post('/register', data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllVisitors(): Promise<AxiosResponse<Visitor[]>> {
  try {
    const response: AxiosResponse<Visitor[]> = await axiosClient.get('/getAllVisitors');
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getVisitorById(id: string): Promise<AxiosResponse<Visitor>> {
  try {
    const response: AxiosResponse<Visitor> = await axiosClient.get(`/viewVisitorDetails/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function updateVisitor(id: string, data: Partial<Visitor>): Promise<AxiosResponse<Visitor>> {
  try {
    const response: AxiosResponse<Visitor> = await axiosClient.put(`/updateVisitorDetails/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function login(data: { email: string; password: string }): Promise<AxiosResponse<{ token: string; user: Visitor }>> {
  try {
    const response: AxiosResponse<{ token: string; user: Visitor }> = await axiosClient.post('/login', data);
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
    const response: AxiosResponse<void> = await axiosClient.post('/logout');
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function forgotPassword(data: { email: string }): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await axiosClient.post('/forgot-password', data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function resetPassword(data: { email: string; token: string; newPassword: string }): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await axiosClient.post('/reset-password', data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function addFavoriteSpecies(visitorId: string, speciesId: string): Promise<AxiosResponse<Visitor>> {
  try {
    const response: AxiosResponse<Visitor> = await axiosClient.post('/addFavoriteSpecies', { visitorId, speciesId });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getFavoriteSpecies(visitorId: string): Promise<AxiosResponse<Visitor>> {
  try {
    const response: AxiosResponse<Visitor> = await axiosClient.get('/viewFavoriteSpecies', {
      params: { visitorId },
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

export async function deleteSpeciesFromFavorites(visitorId: string, speciesId: string): Promise<AxiosResponse<Visitor>> {
  try {
    const response: AxiosResponse<Visitor> = await axiosClient.delete('/deleteSpeciesFromFavorites', {
      params: { visitorId, speciesId },
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
