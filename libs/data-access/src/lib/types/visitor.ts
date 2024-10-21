import { SpeciesResponse } from './species';

export interface RegisterVisitorData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  isVerified: boolean;
}

export interface VisitorResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  favoriteSpecies?: SpeciesResponse[];
  isVerified: boolean;
  // attractionTicketTransactions?: AttractionTicketTransactionResponse[],
}
//conflict here

export interface VisitorLoginData {
  email: string;
  password: string;
}

export interface VisitorLogoutResponse {
  message: string;
}

export interface VisitorUpdateData {
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  email?: string;
}

export interface VisitorPasswordResetRequestData {
  email: string;
}

export interface VisitorPasswordResetData {
  token: string;
  newPassword: string;
}

export interface VerifyVisitorData {
  token: string;
}

// Define the data required to add or delete a favorite species
export interface FavoriteSpeciesRequestData {
  visitorId: string;
  speciesId: string;
}

export interface GetFavoriteSpeciesRequestData {
  visitorId: string;
}

// Define the data returned by the get favorite species response
export interface GetFavoriteSpeciesResponse {
  favoriteSpecies: SpeciesResponse[];
}

export interface DeleteVisitorRequestData {
  id: string;
  password: string;
}

export interface DeleteVisitorResponse {
  message: string;
}
