import { OccurrenceResponse } from "./occurrence";
import { ConservationStatusEnum, LightTypeEnum, SoilTypeEnum } from "./sharedenums";
// Define the Species interface
export interface SpeciesResponse {
  id: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  speciesName: string;
  commonName: string;
  speciesDescription: string;
  conservationStatus: ConservationStatusEnum;
  originCountry: string;
  lightType: LightTypeEnum;
  soilType: SoilTypeEnum;
  fertiliserType: string;
  images: string[];
  waterRequirement: number;
  fertiliserRequirement: number;
  idealHumidity: number;
  minTemp: number;
  maxTemp: number;
  idealTemp: number;
  isDroughtTolerant: boolean;
  isFastGrowing: boolean;
  isSlowGrowing: boolean;
  isEdible: boolean;
  isDeciduous: boolean;
  isEvergreen: boolean;
  isToxic: boolean;
  isFragrant: boolean;
}

export interface CreateSpeciesData {
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  speciesName: string;
  commonName: string;
  speciesDescription: string;
  conservationStatus: ConservationStatusEnum;
  originCountry: string;
  lightType: LightTypeEnum;
  soilType: SoilTypeEnum;
  fertiliserType: string;
  images: string[];
  waterRequirement: number;
  fertiliserRequirement: number;
  idealHumidity: number;
  minTemp: number;
  maxTemp: number;
  idealTemp: number;
  isDroughtTolerant: boolean;
  isFastGrowing: boolean;
  isSlowGrowing: boolean;
  isEdible: boolean;
  isDeciduous: boolean;
  isEvergreen: boolean;
  isToxic: boolean;
  isFragrant: boolean;
}


/* redundant
export interface GetAllSpeciesResponse {
  data: Species[];
}

export interface GetSpeciesByIdResponse {
  data: Species;
}
*/

export interface DeleteSpeciesResponse {
  message: string;
}
