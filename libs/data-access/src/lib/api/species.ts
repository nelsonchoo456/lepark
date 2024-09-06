import axios, { AxiosResponse } from 'axios';
import { ConservationStatusEnum, LightTypeEnum, SoilTypeEnum, Species, SpeciesResponse } from '../types/species'; // Adjust the import path as necessary

const axiosClient = axios.create({
  baseURL: 'http://localhost:3333/api/species', // Replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // optional: specify request timeout in milliseconds
});

export async function createSpecies(data: Species): Promise<AxiosResponse<Species>> {
  try {
    const response: AxiosResponse<Species> = await axiosClient.post('/createSpecies', data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllSpecies(): Promise<AxiosResponse<Species[]>> {
  try {
    const response: AxiosResponse<Species[]> = await axiosClient.get('/getAllSpecies');
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getSpeciesById(id: string): Promise<AxiosResponse<Species>> {
  try {
    const response: AxiosResponse<Species> = await axiosClient.get(`/viewSpeciesDetails/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function updateSpecies(id: string, data: Partial<Species>): Promise<AxiosResponse<Species>> {
  try {
    const response: AxiosResponse<Species> = await axiosClient.put(`/updateSpeciesDetails/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function deleteSpecies(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await axiosClient.delete(`/deleteSpecies/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}
