// Define the Visitor interface
export interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  contactNumber: string;
  favoriteSpeciesIds: string[]; // Array of species IDs
}

// Define the response type for fetching visitors
export interface VisitorResponse {
  data: Visitor[];
  total: number;
  page: number;
  pageSize: number;
}