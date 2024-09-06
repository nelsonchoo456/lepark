import axios, { AxiosResponse } from 'axios';
import { OccurrenceData, OccurrenceResponse } from '../types/occurrence';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3333/api/occurrences', // Replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // optional: specify request timeout in milliseconds
});

export async function createOccurrence(data: OccurrenceData): Promise<AxiosResponse<OccurrenceResponse>> {

  try {
    const response: AxiosResponse<OccurrenceResponse> = await axiosClient.post('/createOccurrence', data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}
