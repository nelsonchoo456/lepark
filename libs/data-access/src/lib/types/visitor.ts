export interface RegisterVisitorData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
}

export interface VisitorResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  favoriteSpecies?: FavoriteSpeciesResponse[];
}

export interface FavoriteSpeciesResponse {
  id: string;
  speciesName: string;
  commonName: string;
  // Add other relevant species fields here
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

// Define the data required to add or delete a favorite species
export interface FavoriteSpeciesRequestData {
  visitorId: string;
  speciesId: string;
}

export interface GetFavoriteSpeciesRequestData {
  visitorId: string;
}

// Define the data returned by the get favorite species response
export interface GetFavoriteSpeciesResponseData {
  favoriteSpecies: FavoriteSpeciesResponse[];
}
