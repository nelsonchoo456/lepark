import axios, { AxiosResponse } from 'axios';
import {
  EventTicketTransactionResponse,
  CreateEventTicketTransactionData,
  EventTicketResponse,
  UpdateEventTicketStatusData,
  CreateEventTicketTransactionPaymentIntentResponse,
  FetchEventTicketTransactionStripeKeyResponse,
  FetchEventTicketTransactionPaymentResponse,
} from '../types/eventTicket';
import client from './client';

const URL = '/eventTickets';

export async function createEventTicketTransaction(
  data: CreateEventTicketTransactionData,
): Promise<AxiosResponse<EventTicketTransactionResponse>> {
  try {
    const response: AxiosResponse<EventTicketTransactionResponse> = await client.post(
      `${URL}/createEventTicketTransaction`,
      data,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw new Error(error.response.data.error);
    } else {
      throw error;
    }
  }
}

export async function getEventTicketTransactionById(id: string): Promise<AxiosResponse<EventTicketTransactionResponse>> {
  try {
    const response: AxiosResponse<EventTicketTransactionResponse> = await client.get(
      `${URL}/viewEventTicketTransactionDetails/${id}`,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getEventTicketTransactionsByVisitorId(
  visitorId: string,
): Promise<AxiosResponse<EventTicketTransactionResponse[]>> {
  try {
    const response: AxiosResponse<EventTicketTransactionResponse[]> = await client.get(
      `${URL}/getEventTicketTransactionsByVisitorId/${visitorId}`,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getEventTicketTransactionsByEventId(
  eventId: string,
): Promise<AxiosResponse<EventTicketTransactionResponse[]>> {
  try {
    const response: AxiosResponse<EventTicketTransactionResponse[]> = await client.get(
      `${URL}/getEventTicketTransactionsByEventId/${eventId}`,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteEventTicketTransaction(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteEventTicketTransaction/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getEventTicketById(id: string): Promise<AxiosResponse<EventTicketResponse>> {
  try {
    const response: AxiosResponse<EventTicketResponse> = await client.get(`${URL}/viewEventTicketDetails/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteEventTicket(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteEventTicket/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getEventTicketsByTransactionId(transactionId: string): Promise<AxiosResponse<EventTicketResponse[]>> {
  try {
    const response: AxiosResponse<EventTicketResponse[]> = await client.get(
      `${URL}/getEventTicketsByTransactionId/${transactionId}`,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getEventTicketsByListingId(listingId: string): Promise<AxiosResponse<EventTicketResponse[]>> {
  try {
    const response: AxiosResponse<EventTicketResponse[]> = await client.get(`${URL}/getEventTicketsByListingId/${listingId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateEventTicketStatus(
  id: string,
  data: UpdateEventTicketStatusData,
): Promise<AxiosResponse<EventTicketResponse>> {
  try {
    const response: AxiosResponse<EventTicketResponse> = await client.put(`${URL}/updateEventTicketStatus/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function createEventTicketTransactionPaymentIntent(total: number): Promise<AxiosResponse<CreateEventTicketTransactionPaymentIntentResponse>> {
  try {
    const response: AxiosResponse<CreateEventTicketTransactionPaymentIntentResponse> = await client.post(`${URL}/create-payment-intent`, { total });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getEventTicketTransactionStripePublishableKey(): Promise<string> {
  try {
    const response: AxiosResponse<FetchEventTicketTransactionStripeKeyResponse> = await client.get(`${URL}/stripe-key`);
    return response.data.publishableKey;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getEventTicketsByEventId(eventId: string): Promise<AxiosResponse<EventTicketResponse[]>> {
  try {
    const response: AxiosResponse<EventTicketResponse[]> = await client.get(
      `${URL}/getEventTicketsByEventId/${eventId}`
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}
  
export async function fetchEventTicketTransactionPayment(paymentIntentId: string): Promise<AxiosResponse<FetchEventTicketTransactionPaymentResponse>> {
  try {
    const response: AxiosResponse<FetchEventTicketTransactionPaymentResponse> = await client.get(`${URL}/fetchPayment/${paymentIntentId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function verifyEventTicket(ticketId: string): Promise<AxiosResponse<{ isValid: boolean }>> {
  try {
    const response: AxiosResponse<{ isValid: boolean }> = await client.get(`${URL}/verify-event-ticket/${ticketId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
      throw error.response.data.error;
    } else {
      throw error;
    }
  }
}