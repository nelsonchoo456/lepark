import axios, { AxiosResponse } from 'axios';
import {
  AttractionTicketTransactionResponse,
  CreateAttractionTicketTransactionData,
  AttractionTicketResponse,
  UpdateAttractionTicketStatusData,
  CreatePaymentIntentResponse,
  StripeKeyResponse,
} from '../types/attractionTicket';
import client from './client';

const URL = '/attractionTickets';

export async function createAttractionTicketTransaction(
  data: CreateAttractionTicketTransactionData,
): Promise<AxiosResponse<AttractionTicketTransactionResponse>> {
  try {
    const response: AxiosResponse<AttractionTicketTransactionResponse> = await client.post(
      `${URL}/createAttractionTicketTransaction`,
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

export async function getAttractionTicketTransactionById(id: string): Promise<AxiosResponse<AttractionTicketTransactionResponse>> {
  try {
    const response: AxiosResponse<AttractionTicketTransactionResponse> = await client.get(
      `${URL}/viewAttractionTicketTransactionDetails/${id}`,
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

export async function getAttractionTicketTransactionsByVisitorId(
  visitorId: string,
): Promise<AxiosResponse<AttractionTicketTransactionResponse[]>> {
  try {
    const response: AxiosResponse<AttractionTicketTransactionResponse[]> = await client.get(
      `${URL}/getAttractionTicketTransactionsByVisitorId/${visitorId}`,
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

export async function getAttractionTicketTransactionsByAttractionId(
  attractionId: string,
): Promise<AxiosResponse<AttractionTicketTransactionResponse[]>> {
  try {
    const response: AxiosResponse<AttractionTicketTransactionResponse[]> = await client.get(
      `${URL}/getAttractionTicketTransactionsByAttractionId/${attractionId}`,
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

// export async function deleteAttractionTicketTransaction(id: string): Promise<AxiosResponse<void>> {
//   try {
//     const response: AxiosResponse<void> = await client.delete(`${URL}/deleteAttractionTicketTransaction/${id}`);
//     return response;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       throw error.response?.data.error || error.message;
//     } else {
//       throw error;
//     }
//   }
// }

// export async function createAttractionTicket(data: CreateAttractionTicketData): Promise<AxiosResponse<AttractionTicketResponse>> {
//   try {
//     const response: AxiosResponse<AttractionTicketResponse> = await client.post(`${URL}/createAttractionTicket`, data);
//     return response;
//   } catch (error) {
//     if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
//       throw new Error(error.response.data.error);
//     } else {
//       throw error;
//     }
//   }
// }

export async function getAttractionTicketById(id: string): Promise<AxiosResponse<AttractionTicketResponse>> {
  try {
    const response: AxiosResponse<AttractionTicketResponse> = await client.get(`${URL}/viewAttractionTicketDetails/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function deleteAttractionTicket(id: string): Promise<AxiosResponse<void>> {
  try {
    const response: AxiosResponse<void> = await client.delete(`${URL}/deleteAttractionTicket/${id}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getAttractionTicketsByTransactionId(transactionId: string): Promise<AxiosResponse<AttractionTicketResponse[]>> {
  try {
    const response: AxiosResponse<AttractionTicketResponse[]> = await client.get(
      `${URL}/getAttractionTicketsByTransactionId/${transactionId}`,
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

export async function getAttractionTicketsByListingId(listingId: string): Promise<AxiosResponse<AttractionTicketResponse[]>> {
  try {
    const response: AxiosResponse<AttractionTicketResponse[]> = await client.get(`${URL}/getAttractionTicketsByListingId/${listingId}`);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function updateAttractionTicketStatus(
  id: string,
  data: UpdateAttractionTicketStatusData,
): Promise<AxiosResponse<AttractionTicketResponse>> {
  try {
    const response: AxiosResponse<AttractionTicketResponse> = await client.put(`${URL}/updateAttractionTicketStatus/${id}`, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function createPaymentIntent(total: number): Promise<AxiosResponse<CreatePaymentIntentResponse>> {
  try {
    const response: AxiosResponse<CreatePaymentIntentResponse> = await client.post(`${URL}/create-payment-intent`, { total });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}

export async function getStripePublishableKey(): Promise<string> {
  try {
    const response: AxiosResponse<StripeKeyResponse> = await client.get(`${URL}/stripe-key`);
    return response.data.publishableKey;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data.error || error.message;
    } else {
      throw error;
    }
  }
}