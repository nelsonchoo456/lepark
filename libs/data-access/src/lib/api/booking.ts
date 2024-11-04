import axios, { AxiosResponse } from 'axios';
import { BookingResponse, CreateBookingData, UpdateBookingStatusData } from '../types/booking';
import client from './client';

const URL = '/bookings';

export async function createBooking(data: CreateBookingData): Promise<AxiosResponse<BookingResponse>> {
  try {
    const response: AxiosResponse<BookingResponse> = await client.post(`${URL}/createBooking`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw new Error(error.response.data.error);
    } else {
      throw error;
    }
  }
}

export async function getBookingById(id: string): Promise<AxiosResponse<BookingResponse>> {
  try {
    const response: AxiosResponse<BookingResponse> = await client.get(`${URL}/viewBookingDetails/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getAllBookings(): Promise<AxiosResponse<BookingResponse[]>> {
  try {
    const response: AxiosResponse<BookingResponse[]> = await client.get(`${URL}/getAllBookings`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateBookingStatus(id: string, data: UpdateBookingStatusData): Promise<AxiosResponse<BookingResponse>> {
  try {
    const response: AxiosResponse<BookingResponse> = await client.put(`${URL}/updateBookingStatus/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteBooking(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteBooking/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getBookingsByVisitorId(visitorId: string): Promise<AxiosResponse<BookingResponse[]>> {
  try {
    const response: AxiosResponse<BookingResponse[]> = await client.get(`${URL}/getBookingsByVisitorId/${visitorId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getBookingsByFacilityId(facilityId: string): Promise<AxiosResponse<BookingResponse[]>> {
  try {
    const response: AxiosResponse<BookingResponse[]> = await client.get(`${URL}/getBookingsByFacilityId/${facilityId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getBookingsByParkId(parkId: number): Promise<AxiosResponse<BookingResponse[]>> {
  try {
    const response: AxiosResponse<BookingResponse[]> = await client.get(`${URL}/getBookingsByParkId/${parkId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateBooking(id: string, data: Partial<BookingResponse>): Promise<AxiosResponse<BookingResponse>> {
  try {
    const response: AxiosResponse<BookingResponse> = await client.put(`${URL}/updateBooking/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}
