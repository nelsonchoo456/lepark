//create species form
export const phylums: string[] = [
  "Anthocerotophyta", "Bryophyta", "Charophyta", "Chlorophyta", "Cycadophyta",
  "Ginkgophyta", "Glaucophyta", "Gnetophyta", "Lycopodiophyta", "Lycophyta",
  "Magnoliophyta", "Marchantiophyta", "Hepatophyta", "Polypodiophyta",
  "Monilophyta", "Picozoa", "Pinophyta", "Coniferophyta", "Prasinodermophyta",
  "Rhodophyta"
];

export const regions: string[] = [
  'North America', 'Central America', 'South America', 'Caribbean', 'Europe', 'Northern Africa',
  'Sub-Saharan Africa', 'Middle East', 'Central Asia', 'South Asia', 'Southeast Asia',
  'East Asia', 'Australasia', 'Pacific Islands', 'Mediterranean', 'Western Asia', 'Eastern Asia',
  'Southern Africa', 'Arctic', 'Antarctica', 'Tropical Rainforest', 'Temperate Forest',
  'Savanna', 'Desert', 'Tundra', 'Boreal Forest'
];

export const lightType: string[] = ['FULL_SHADE', 'PARTIAL_SHADE', 'FULL_SUN'];

export const soilType: string[] = ['SANDY', 'CLAYEY', 'LOAMY'];

export const conservationStatus: string[] = ["LEAST_CONCERN", "NEAR_THREATENED", "VULNERABLE", "ENDANGERED", "CRITICALLY_ENDANGERED", "EXTINCT_IN_THE_WILD", "EXTINCT", "DATA_DEFICIENT"];

export const plantCharacteristics: string[] = ["Fast Growing", "Edible", "Toxic", "Evergreen", "Fragrant", "Drought Tolerant", "Flowering"];

interface Species {
  id: number;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  speciesName: string;
  commonName: string;
  speciesDescription: string;
  conservationStatus: string;
  originCountry: string;
  fertiliserType: string;
  lightType: string;
  soilType: string;
  waterRequirement: number;
  fertiliserRequirement: number;
  idealHumidity: number;
  minTemp: number;
  maxTemp: number;
  idealTemp: number;
  isFastGrowing: boolean;
  isEdible: boolean;
  isToxic: boolean;
  isEvergreen: boolean;
  isFragrant: boolean;
  isDroughtTolerant: boolean;
  isFlowering: boolean;
}

export const speciesExamples: Species[] = [
  { id: 1234567890, phylum: "Tracheophyta", class: "Magnoliopsida", order: "Fabales", family: "Fabaceae", genus: "Acacia", speciesName: "Acacia koa", commonName: "Koa", speciesDescription: "Acacia koa is a species of flowering tree endemic to the Hawaiian Islands.", conservationStatus: "VULNERABLE", originCountry: "Hawaii, USA", fertiliserType: "Balanced NPK", lightType: "FULL_SUN", soilType: "WELL_DRAINED", waterRequirement: 3, fertiliserRequirement: 2.5, idealHumidity: 60.0, minTemp: 10.0, maxTemp: 30.0, idealTemp: 22.0, isFastGrowing: true, isEdible: false, isToxic: false, isEvergreen: true, isFragrant: false, isDroughtTolerant: true, isFlowering: true },
  { id: 2345678901, phylum: "Tracheophyta", class: "Liliopsida", order: "Asparagales", family: "Orchidaceae", genus: "Phalaenopsis", speciesName: "Phalaenopsis amabilis", commonName: "Moon Orchid", speciesDescription: "Phalaenopsis amabilis, known as the Moon Orchid, is a species of flowering plant in the orchid family.", conservationStatus: "LEAST_CONCERN", originCountry: "Indonesia", fertiliserType: "Orchid-specific", lightType: "PARTIAL_SHADE", soilType: "WELL_DRAINED", waterRequirement: 2, fertiliserRequirement: 1.5, idealHumidity: 70.0, minTemp: 18.0, maxTemp: 29.0, idealTemp: 24.0, isFastGrowing: false, isEdible: false, isToxic: false, isEvergreen: true, isFragrant: true, isDroughtTolerant: false, isFlowering: true },
  { id: 3456789012, phylum: "Tracheophyta", class: "Pinopsida", order: "Pinales", family: "Pinaceae", genus: "Pinus", speciesName: "Pinus sylvestris", commonName: "Scots Pine", speciesDescription: "Pinus sylvestris, the Scots pine, is a species of tree in the pine family Pinaceae.", conservationStatus: "LEAST_CONCERN", originCountry: "Scotland", fertiliserType: "Slow-release", lightType: "FULL_SUN", soilType: "SANDY", waterRequirement: 2, fertiliserRequirement: 1.0, idealHumidity: 50.0, minTemp: -40.0, maxTemp: 35.0, idealTemp: 15.0, isFastGrowing: false, isEdible: false, isToxic: false, isEvergreen: true, isFragrant: true, isDroughtTolerant: true, isFlowering: false },
    { id: 4567890123, phylum: "Tracheophyta", class: "Magnoliopsida", order: "Rosales", family: "Rosaceae", genus: "Malus", speciesName: "Malus domestica", commonName: "Apple Tree", speciesDescription: "Malus domestica, the apple tree, is a deciduous tree in the rose family best known for its sweet, pomaceous fruit, the apple.", conservationStatus: "LEAST_CONCERN", originCountry: "Kazakhstan", fertiliserType: "Balanced NPK", lightType: "FULL_SUN", soilType: "LOAMY", waterRequirement: 3, fertiliserRequirement: 2.0, idealHumidity: 60.0, minTemp: -40.0, maxTemp: 35.0, idealTemp: 20.0, isFastGrowing: false, isEdible: true, isToxic: false, isEvergreen: false, isFragrant: true, isDroughtTolerant: false, isFlowering: true },
{ id: 5678901234, phylum: "Tracheophyta", class: "Liliopsida", order: "Arecales", family: "Arecaceae", genus: "Cocos", speciesName: "Cocos nucifera", commonName: "Coconut Palm", speciesDescription: "Cocos nucifera, the coconut palm, is a member of the palm tree family and the only living species of the genus Cocos.", conservationStatus: "LEAST_CONCERN", originCountry: "Tropical regions worldwide", fertiliserType: "Palm-specific", lightType: "FULL_SUN", soilType: "SANDY", waterRequirement: 4, fertiliserRequirement: 2.5, idealHumidity: 70.0, minTemp: 18.0, maxTemp: 35.0, idealTemp: 27.0, isFastGrowing: true, isEdible: true, isToxic: false, isEvergreen: true, isFragrant: false, isDroughtTolerant: true, isFlowering: true },
{ id: 6789012345, phylum: "Tracheophyta", class: "Magnoliopsida", order: "Caryophyllales", family: "Cactaceae", genus: "Opuntia", speciesName: "Opuntia ficus-indica", commonName: "Prickly Pear", speciesDescription: "Opuntia ficus-indica, the prickly pear, is a species of cactus that has long been a domesticated crop plant grown for its edible fruits.", conservationStatus: "LEAST_CONCERN", originCountry: "Mexico", fertiliserType: "Cactus-specific", lightType: "FULL_SUN", soilType: "SANDY", waterRequirement: 1, fertiliserRequirement: 0.5, idealHumidity: 30.0, minTemp: -10.0, maxTemp: 40.0, idealTemp: 25.0, isFastGrowing: false, isEdible: true, isToxic: false, isEvergreen: true, isFragrant: false, isDroughtTolerant: true, isFlowering: true }
];

export const species: Species = { id: 1234567890, phylum: "Tracheophyta", class: "Magnoliopsida", order: "Fabales", family: "Fabaceae", genus: "Acacia", speciesName: "Acacia koa", commonName: "Koa", speciesDescription: "Acacia koa is a species of flowering tree endemic to the Hawaiian Islands.", conservationStatus: "VULNERABLE", originCountry: "Hawaii, USA", fertiliserType: "Balanced NPK", lightType: "FULL_SUN", soilType: "WELL_DRAINED", waterRequirement: 3, fertiliserRequirement: 2.5, idealHumidity: 60.0, minTemp: 10.0, maxTemp: 30.0, idealTemp: 22.0, isFastGrowing: true, isEdible: false, isToxic: false, isEvergreen: true, isFragrant: false, isDroughtTolerant: true, isFlowering: true };

interface BlankSpecies {
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  speciesName: string;
  commonName: string;
  speciesDescription: string;
  conservationStatus: string;
  originCountry: string;
  lightType: string;
  soilType: string;
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

export const blankSpecies: BlankSpecies = {
  phylum: "",
  class: "",
  order: "",
  family: "",
  genus: "",
  speciesName: "",
  commonName: "",
  speciesDescription: "",
  conservationStatus: "",
  originCountry: "",
  lightType: "",
  soilType: "",
  fertiliserType: "",
  images: [],
  waterRequirement: 0,
  fertiliserRequirement: 0,
  idealHumidity: 0,
  minTemp: 0,
  maxTemp: 0,
  idealTemp: 0,
  isDroughtTolerant: false,
  isFastGrowing: false,
  isSlowGrowing: false,
  isEdible: false,
  isDeciduous: false,
  isEvergreen: false,
  isToxic: false,
  isFragrant: false
};
