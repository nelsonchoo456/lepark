export interface OccurrenceData {
  lat: number;
  lng: number;
  title: string;
  dateObserved: string;
  dateOfBirth: string;
  numberOfPlants: number;
  biomass: number;
  description: string;
  decarbomizationType: string;
  speciesId: string;
}

export interface OccurrenceResponse {
  id: string;
  lat: number;
  lng: number;
  title: string;
  dateObserved: string;
  dateOfBirth: string;
  numberOfPlants: number;
  biomass: number;
  description: string;
  decarbomizationType: string;
  speciesId: string;
}