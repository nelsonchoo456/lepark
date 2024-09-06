// Define the Visitor interface
export interface VisitorResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  favoriteSpeciesIds: string[]; // Array of species IDs
}

/* redundant
export interface VisitorResponse {
  data: VisitorResponse[];
}
*/

export interface RegisterVisitorData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  favoriteSpeciesIds?: string[]; // Array of species IDs
}

export interface UpdateVisitorData extends Partial<RegisterVisitorData> {}

// Define the data required for the login request
export interface LoginRequestData {
  email: string;
  password: string;
}

// Define the data returned by the login response
export interface LoginResponseData {
  token: string;
  user: VisitorResponse;
}

// Define the data required for the forgot password request
export interface ForgotPasswordRequestData {
  email: string;
}

// Define the data required for the reset password request
export interface ResetPasswordRequestData {
  email: string;
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
  favoriteSpeciesIds: string[];
}
