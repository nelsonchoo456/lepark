import axios, { AxiosResponse } from 'axios';
import client from './client';
import { FeedbackData, FeedbackResponse, FeedbackUpdateData } from '../types/feedback';

const URL = '/feedback';

export async function createFeedback(data: FeedbackData): Promise<AxiosResponse<FeedbackResponse>> {
  try {
    const response: AxiosResponse<FeedbackResponse> = await client.post(`${URL}/createFeedback`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}

export async function getAllFeedbacks(visitorId: string): Promise<AxiosResponse<FeedbackResponse[]>> {
  try {
    const response: AxiosResponse<FeedbackResponse[]> = await client.get(`${URL}/getAllFeedback/${visitorId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getFeedbackById(id: string): Promise<AxiosResponse<FeedbackResponse>> {
  try {
    const response: AxiosResponse<FeedbackResponse> = await client.get(`${URL}/getFeedbackById/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateFeedback(id: string, data: FeedbackUpdateData): Promise<AxiosResponse<FeedbackResponse>> {
  try {
    const response: AxiosResponse<FeedbackResponse> = await client.put(`${URL}/updateFeedback/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteFeedback(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteFeedback/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getFeedbackByParkId(parkId: number): Promise<AxiosResponse<FeedbackResponse[]>> {
  try {
    const response: AxiosResponse<FeedbackResponse[]> = await client.get(`${URL}/getFeedbackByParkId/${parkId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}
