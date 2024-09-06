//create species form
export const phylums = [
  "Anthocerotophyta", "Bryophyta", "Charophyta", "Chlorophyta", "Cycadophyta",
  "Ginkgophyta", "Glaucophyta", "Gnetophyta", "Lycopodiophyta", "Lycophyta",
  "Magnoliophyta", "Marchantiophyta", "Hepatophyta", "Polypodiophyta",
  "Monilophyta", "Picozoa", "Pinophyta", "Coniferophyta", "Prasinodermophyta",
  "Rhodophyta"
];

export const regions = [
  'North America', 'Central America', 'South America', 'Caribbean', 'Europe', 'Northern Africa',
  'Sub-Saharan Africa', 'Middle East', 'Central Asia', 'South Asia', 'Southeast Asia',
  'East Asia', 'Australasia', 'Pacific Islands', 'Mediterranean', 'Western Asia', 'Eastern Asia',
  'Southern Africa', 'Arctic', 'Antarctica', 'Tropical Rainforest', 'Temperate Forest',
  'Savanna', 'Desert', 'Tundra', 'Boreal Forest'
];

export const lightType = ['Full Shade', 'Partial Shade', 'Full Sun'];

export const soilType = ['Sandy','Clayey','Loamy'];

export const conservationStatus = ["Least Concern", "Near Threatened", "Vulnerable", "Endangered", "Critically Endangered", "Extinct in the Wild", "Extinct"];

export const plantCharacteristics = ["Fast Growing", "Edible", "Toxic", "Evergreen", "Fragrant", "Drought Tolerant", "Flowering"];

//view species
export const speciesExamples = [{ id: 1234567890, phylum: "Tracheophyta", class: "Magnoliopsida", order: "Fabales", family: "Fabaceae", genus: "Acacia", speciesName: "Acacia koa", commonName: "Koa", speciesDescription: "Acacia koa is a species of flowering tree endemic to the Hawaiian Islands.", conservationStatus: "VULNERABLE", originCountry: "Hawaii, USA", fertiliserType: "Balanced NPK", lightType: "FULL_SUN", soilType: "WELL_DRAINED", waterRequirement: 3, fertiliserRequirement: 2.5, idealHumidity: 60.0, minTemp: 10.0, maxTemp: 30.0, idealTemp: 22.0, isFastGrowing: true, isEdible: false, isToxic: false, isEvergreen: true, isFragrant: false, isDroughtTolerant: true, isFlowering: true }, { id: 2345678901, phylum: "Tracheophyta", class: "Liliopsida", order: "Asparagales", family: "Orchidaceae", genus: "Phalaenopsis", speciesName: "Phalaenopsis amabilis", commonName: "Moon Orchid", speciesDescription: "Phalaenopsis amabilis, known as the Moon Orchid, is a species of flowering plant in the orchid family.", conservationStatus: "LEAST_CONCERN", originCountry: "Indonesia", fertiliserType: "Orchid-specific", lightType: "PARTIAL_SHADE", soilType: "WELL_DRAINED", waterRequirement: 2, fertiliserRequirement: 1.5, idealHumidity: 70.0, minTemp: 18.0, maxTemp: 29.0, idealTemp: 24.0, isFastGrowing: false, isEdible: false, isToxic: false, isEvergreen: true, isFragrant: true, isDroughtTolerant: false, isFlowering: true }, { id: 3456789012, phylum: "Tracheophyta", class: "Pinopsida", order: "Pinales", family: "Pinaceae", genus: "Pinus", speciesName: "Pinus sylvestris", commonName: "Scots Pine", speciesDescription: "Pinus sylvestris, the Scots pine, is a species of tree in the pine family Pinaceae.", conservationStatus: "LEAST_CONCERN", originCountry: "Scotland", fertiliserType: "Slow-release", lightType: "FULL_SUN", soilType: "SANDY", waterRequirement: 2, fertiliserRequirement: 1.0, idealHumidity: 50.0, minTemp: -40.0, maxTemp: 35.0, idealTemp: 15.0, isFastGrowing: false, isEdible: false, isToxic: false, isEvergreen: true, isFragrant: true, isDroughtTolerant: true, isFlowering: false }];

//view 1 species
export const species = { id: 1234567890, phylum: "Tracheophyta", class: "Magnoliopsida", order: "Fabales", family: "Fabaceae", genus: "Acacia", speciesName: "Acacia koa", commonName: "Koa", speciesDescription: "Acacia koa is a species of flowering tree endemic to the Hawaiian Islands.", conservationStatus: "VULNERABLE", originCountry: "Hawaii, USA", fertiliserType: "Balanced NPK", lightType: "FULL_SUN", soilType: "WELL_DRAINED", waterRequirement: 3, fertiliserRequirement: 2.5, idealHumidity: 60.0, minTemp: 10.0, maxTemp: 30.0, idealTemp: 22.0, isFastGrowing: true, isEdible: false, isToxic: false, isEvergreen: true, isFragrant: false, isDroughtTolerant: true, isFlowering: true };

//create species form blank
export const blankSpecies = {
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
