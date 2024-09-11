export enum ConservationStatusEnum {
  LEAST_CONCERN = 'LEAST_CONCERN',
  NEAR_THREATENED = 'NEAR_THREATENED',
  VULNERABLE = 'VULNERABLE',
  ENDANGERED = 'ENDANGERED',
  CRITICALLY_ENDANGERED = 'CRITICALLY_ENDANGERED',
  EXTINCT_IN_THE_WILD = 'EXTINCT_IN_THE_WILD',
  EXTINCT = 'EXTINCT',
}

export enum LightTypeEnum {
  FULL_SUN = 'FULL_SUN',
  PARTIAL_SHADE = 'PARTIAL_SHADE',
  FULL_SHADE = 'FULL_SHADE',
}

export enum SoilTypeEnum {
  SANDY = 'SANDY',
  CLAYEY = 'CLAYEY',
  LOAMY = 'LOAMY',
}

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

export interface UpdateSpeciesData extends Partial<CreateSpeciesData> {}

export interface DeleteSpeciesResponse {
  message: string;
}