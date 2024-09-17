const parksData = [
  {
    name: 'Bishan-AMK Park',
    address: '1 Fullerton Road, Singapore 049213',
    contactNumber: '88887777',
    description: 'Bishan-Ang Mo Kio Park is one of the largest urban parks...',
    openingHours: [
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
    ],
    closingHours: [
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
    ],
    geom: 'POLYGON((103.854 1.292, 103.855 1.293, 103.856 1.292, 103.855 1.291, 103.854 1.292))',
    paths: 'LINESTRING(103.854 1.292, 103.855 1.293, 103.856 1.292)',
    parkStatus: 'OPEN',
    images: ['https://lepark.s3.ap-southeast-1.amazonaws.com/park/1726197675165-HD.Singapore_Bishan%2BPark_c%2BDreiseitl_109%2B.jpg'],
  },
  {
    name: 'Singapore Botanic Gardens',
    address: '1 Cluny Road, Singapore 259569',
    contactNumber: '88886666',
    description: 'The Singapore Botanic Gardens is a 163-year-old tropical garden...',
    openingHours: [
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
    ],
    closingHours: [
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
    ],
    geom: 'POLYGON((103.815 1.304, 103.816 1.305, 103.817 1.304, 103.816 1.303, 103.815 1.304))',
    paths: 'LINESTRING(103.815 1.304, 103.816 1.305, 103.817 1.304)',
    parkStatus: 'OPEN',
    images: ['https://lepark.s3.ap-southeast-1.amazonaws.com/park/Botanic-gardens.jpg'],
  },
];

const zonesData = [
  {
    name: 'Palm Valley',
    description: 'Palm leaves trees from Southeast Asia. A quiet reserve for relaxation and relaxing walks.',
    openingHours: [
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
    ],
    closingHours: [
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
    ],
    geom: 'POLYGON((103.854 1.292, 103.855 1.293, 103.856 1.292, 103.855 1.291, 103.854 1.292))',
    paths: 'LINESTRING(103.854 1.292, 103.855 1.293, 103.856 1.292)',
    zoneStatus: 'OPEN',
    parkId: 1,
  },
  {
    name: 'Swan Lake',
    description:
      'A serene lake surrounded by lush greenery, home to a pair of beautiful swans. Popular among visitors for peaceful walks and photography.',
    openingHours: [
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
    ],
    closingHours: [
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
    ],
    geom: 'POLYGON((103.812 1.305, 103.813 1.306, 103.814 1.305, 103.813 1.304, 103.812 1.305))',
    paths: 'LINESTRING(103.812 1.305, 103.813 1.306, 103.814 1.305)',
    zoneStatus: 'OPEN',
    parkId: 2,
  },
  {
    name: 'Healing Garden',
    description:
      'A tranquil area dedicated to medicinal plants from Southeast Asia, designed to promote wellness and relaxation. The Healing Garden showcases over 400 species of plants.',
    openingHours: [
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
      '2024-09-08T06:00:00Z',
    ],
    closingHours: [
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
      '2024-09-08T20:00:00Z',
    ],
    geom: 'POLYGON((103.818 1.303, 103.819 1.304, 103.820 1.303, 103.819 1.302, 103.818 1.303))',
    paths: 'LINESTRING(103.818 1.303, 103.819 1.304, 103.820 1.303)',
    zoneStatus: 'OPEN',
    parkId: 2,
  },
];

const speciesData = [
  {
    phylum: 'Magnoliophyta',
    class: 'Magnoliopsida',
    order: 'Rosales',
    family: 'Rosaceae',
    genus: 'Rosa',
    speciesName: 'Rosa gallica',
    commonName: 'French Rose',
    speciesDescription: 'A species of rose native to southern and central Europe.',
    conservationStatus: 'LEAST_CONCERN',
    originCountry: 'Europe',
    lightType: 'FULL_SHADE',
    soilType: 'LOAMY',
    fertiliserType: 'Organic',
    images: [
      'https://i0.wp.com/sharonsantoni.com/wp-content/uploads/2015/03/old-french-roses-yolande-d-aragon-my-french-country-home.jpg?ssl=1',
      'https://images.squarespace-cdn.com/content/v1/57c60fce197aea3e7a3ac5d0/1496948768427-CIDDNN5S4882DYXSO4AH/English+pink+roses',
    ],
    waterRequirement: 40,
    fertiliserRequirement: 30,
    idealHumidity: 65,
    minTemp: 5,
    maxTemp: 40,
    idealTemp: 25,
    isDroughtTolerant: true,
    isFastGrowing: false,
    isSlowGrowing: true,
    isEdible: false,
    isDeciduous: true,
    isEvergreen: false,
    isToxic: false,
    isFragrant: true,
  },
  {
    phylum: 'Pinophyta',
    class: 'Pinopsida',
    order: 'Pinales',
    family: 'Pinaceae',
    genus: 'Pinus',
    speciesName: 'Pinus sylvestris',
    commonName: 'Scots Pine',
    speciesDescription: 'A species of pine native to Eurasia, widely spread across northern Europe and Asia.',
    conservationStatus: 'LEAST_CONCERN',
    originCountry: 'Europe',
    lightType: 'FULL_SUN',
    soilType: 'SANDY',
    fertiliserType: 'Inorganic',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/9/91/Skuleskogen_pine.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlGsbdby_b1Q6WjQOBo3OXv1Fi_O_K4rZnJQ&s',
    ],
    waterRequirement: 35,
    fertiliserRequirement: 15,
    idealHumidity: 55,
    minTemp: 1,
    maxTemp: 25,
    idealTemp: 10,
    isDroughtTolerant: true,
    isFastGrowing: false,
    isSlowGrowing: true,
    isEdible: false,
    isDeciduous: false,
    isEvergreen: true,
    isToxic: false,
    isFragrant: false,
  },
  {
    phylum: 'Magnoliophyta',
    class: 'Liliopsida',
    order: 'Poales',
    family: 'Poaceae',
    genus: 'Bambusa',
    speciesName: 'Bambusa vulgaris',
    commonName: 'Common Bamboo',
    speciesDescription: 'A species of bamboo widely cultivated in tropical and subtropical regions.',
    conservationStatus: 'LEAST_CONCERN',
    originCountry: 'South Asia',
    lightType: 'FULL_SUN',
    soilType: 'CLAYEY',
    fertiliserType: 'Organic',
    images: [
      'https://images.squarespace-cdn.com/content/v1/5e5cd082c50ea102c52e5bb0/1590049336762-S27YM4UE2NKLPEECQZE8/Bambusa+vulgaris',
      'https://www.bambooaustralia.com.au/wp-content/uploads/2013/05/Bambusa-vulgaris-Common-bamboo.jpg',
    ],
    waterRequirement: 50,
    fertiliserRequirement: 40,
    idealHumidity: 80,
    minTemp: 10,
    maxTemp: 35,
    idealTemp: 25,
    isDroughtTolerant: false,
    isFastGrowing: true,
    isSlowGrowing: false,
    isEdible: true,
    isDeciduous: false,
    isEvergreen: true,
    isToxic: false,
    isFragrant: false,
  },
  {
    phylum: 'Magnoliophyta',
    class: 'Magnoliopsida',
    order: 'Fabales',
    family: 'Fabaceae',
    genus: 'Acacia',
    speciesName: 'Acacia dealbata',
    commonName: 'Silver Wattle',
    speciesDescription: 'A fast-growing shrub native to southeastern Australia.',
    conservationStatus: 'LEAST_CONCERN',
    originCountry: 'Australasia',
    lightType: 'PARTIAL_SHADE',
    soilType: 'LOAMY',
    fertiliserType: 'Organic',
    images: [
      'https://www.victoriannativeseed.com.au/assets/Acacia-dealbata-3.jpg',
      'https://trees.stanford.edu/images/Acacia/ACAdea-lomita.jpg',
    ],
    waterRequirement: 40,
    fertiliserRequirement: 20,
    idealHumidity: 70,
    minTemp: 5,
    maxTemp: 30,
    idealTemp: 20,
    isDroughtTolerant: true,
    isFastGrowing: true,
    isSlowGrowing: false,
    isEdible: false,
    isDeciduous: false,
    isEvergreen: true,
    isToxic: false,
    isFragrant: true,
  },
  {
    phylum: 'Bryophyta',
    class: 'Bryopsida',
    order: 'Hypnales',
    family: 'Hypnaceae',
    genus: 'Hypnum',
    speciesName: 'Hypnum cupressiforme',
    commonName: 'Cypress-leaved Plait-moss',
    speciesDescription: 'A species of moss found in a wide range of habitats across the globe.',
    conservationStatus: 'LEAST_CONCERN',
    originCountry: 'Temperate Forest',
    lightType: 'FULL_SHADE',
    soilType: 'LOAMY',
    fertiliserType: 'None',
    images: [
      'https://warehouse1.indicia.org.uk/upload/13/87/73/p18cdo8cnubiv19g0jfc163a14glr.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQONi83ZpXrEwR0-3vGsICljlgZY1r08vbWsw&s',
    ],
    waterRequirement: 45,
    fertiliserRequirement: 0,
    idealHumidity: 90,
    minTemp: 1,
    maxTemp: 20,
    idealTemp: 15,
    isDroughtTolerant: false,
    isFastGrowing: false,
    isSlowGrowing: true,
    isEdible: false,
    isDeciduous: false,
    isEvergreen: true,
    isToxic: false,
    isFragrant: false,
  },
  {
    phylum: 'Magnoliophyta',
    class: 'Magnoliopsida',
    order: 'Lamiales',
    family: 'Lamiaceae',
    genus: 'Lavandula',
    speciesName: 'Lavandula angustifolia',
    commonName: 'English Lavender',
    speciesDescription: 'A species of lavender native to the Mediterranean, prized for its fragrant flowers.',
    conservationStatus: 'LEAST_CONCERN',
    originCountry: 'Mediterranean',
    lightType: 'FULL_SUN',
    soilType: 'LOAMY',
    fertiliserType: 'Inorganic',
    images: [
      'https://images-cdn.ubuy.co.in/650c7af2026cb65cef0a5940-500-true-english-lavender-vera-lavender.jpg',
      'https://www.thespruce.com/thmb/Ty69Ld4Czf7zlgn73hdb9oDoPEc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/english-lavender-plants-2130856-hero-01-fc261dfea5d442ebb06e4844d4d674fc.jpg',
    ],
    waterRequirement: 30,
    fertiliserRequirement: 25,
    idealHumidity: 60,
    minTemp: 5,
    maxTemp: 35,
    idealTemp: 20,
    isDroughtTolerant: true,
    isFastGrowing: false,
    isSlowGrowing: true,
    isEdible: false,
    isDeciduous: false,
    isEvergreen: true,
    isToxic: false,
    isFragrant: true,
  },
  {
    phylum: 'Magnoliophyta',
    class: 'Magnoliopsida',
    order: 'Rosales',
    family: 'Moraceae',
    genus: 'Ficus',
    speciesName: 'Ficus benjamina',
    commonName: 'Weeping Fig',
    speciesDescription: 'A species of fig tree commonly used as a houseplant.',
    conservationStatus: 'LEAST_CONCERN',
    originCountry: 'South Asia',
    lightType: 'PARTIAL_SHADE',
    soilType: 'SANDY',
    fertiliserType: 'Inorganic',
    images: [
      'https://c8.alamy.com/comp/R6PADR/weeping-fig-tree-R6PADR.jpg',
      'https://sbbeautiful.org/wp-content/uploads/2022/11/Weeping-Fig-Gress-Photo-IMG_0782-3-scaled.jpg',
    ],
    waterRequirement: 30,
    fertiliserRequirement: 15,
    idealHumidity: 75,
    minTemp: 10,
    maxTemp: 35,
    idealTemp: 25,
    isDroughtTolerant: false,
    isFastGrowing: false,
    isSlowGrowing: true,
    isEdible: false,
    isDeciduous: false,
    isEvergreen: true,
    isToxic: true,
    isFragrant: false,
  },
  {
    phylum: 'Pteridophyta',
    class: 'Polypodiopsida',
    order: 'Polypodiales',
    family: 'Polypodiaceae',
    genus: 'Polypodium',
    speciesName: 'Polypodium vulgare',
    commonName: 'Common Polypody',
    speciesDescription: 'A fern species native to temperate regions of the Northern Hemisphere.',
    conservationStatus: 'LEAST_CONCERN',
    originCountry: 'Europe',
    lightType: 'FULL_SHADE',
    soilType: 'LOAMY',
    fertiliserType: 'None',
    images: [
      'https://www.illinoiswildflowers.info/grasses/photos/cm_polypody1.jpg',
      'https://inaturalist-open-data.s3.amazonaws.com/photos/19678/large.jpg',
    ],
    waterRequirement: 50,
    fertiliserRequirement: 0,
    idealHumidity: 75,
    minTemp: 5,
    maxTemp: 20,
    idealTemp: 15,
    isDroughtTolerant: false,
    isFastGrowing: false,
    isSlowGrowing: true,
    isEdible: false,
    isDeciduous: true,
    isEvergreen: false,
    isToxic: false,
    isFragrant: false,
  },
  {
    phylum: 'Magnoliophyta',
    class: 'Magnoliopsida',
    order: 'Asterales',
    family: 'Asteraceae',
    genus: 'Helianthus',
    speciesName: 'Helianthus annuus',
    commonName: 'Sunflower',
    speciesDescription: 'A large annual plant native to North America, known for its large flower heads.',
    conservationStatus: 'LEAST_CONCERN',
    originCountry: 'North America',
    lightType: 'FULL_SUN',
    soilType: 'SANDY',
    fertiliserType: 'Organic',
    images: [
      'https://fareastfloragarden.com/media/wysiwyg/1800x1200px-sunflower-2.jpg',
      'https://fwbg.org/wp-content/uploads/2022/09/Sunflowers-_-pixabay.jpg',
    ],
    waterRequirement: 40,
    fertiliserRequirement: 30,
    idealHumidity: 50,
    minTemp: 15,
    maxTemp: 35,
    idealTemp: 30,
    isDroughtTolerant: true,
    isFastGrowing: true,
    isSlowGrowing: false,
    isEdible: true,
    isDeciduous: true,
    isEvergreen: false,
    isToxic: false,
    isFragrant: false,
  },
  {
    phylum: 'Magnoliophyta',
    class: 'Magnoliopsida',
    order: 'Rosales',
    family: 'Moraceae',
    genus: 'Ficus',
    speciesName: 'Ficus carica',
    commonName: 'Common Fig',
    speciesDescription: 'A species of flowering plant native to the Mediterranean and western Asia, known for its edible fruit.',
    conservationStatus: 'LEAST_CONCERN',
    originCountry: 'Western Asia',
    lightType: 'FULL_SUN',
    soilType: 'LOAMY',
    fertiliserType: 'Organic',
    images: [
      'https://mortonarb.org/app/uploads/2020/12/24710_ca_object_representations_media_58724_large-1920x1280.625-c-default.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuoqE9_MHTXqD6Nl6ucGEs3Kh6ryxxefNwq4iDa9NHTGnyjqyEV9uJb8U24nqsi0n4WoQ&usqp=CAU',
    ],
    waterRequirement: 45,
    fertiliserRequirement: 35,
    idealHumidity: 55,
    minTemp: 10,
    maxTemp: 40,
    idealTemp: 30,
    isDroughtTolerant: true,
    isFastGrowing: true,
    isSlowGrowing: false,
    isEdible: true,
    isDeciduous: true,
    isEvergreen: false,
    isToxic: false,
    isFragrant: false,
  },
  {
    phylum: 'Magnoliophyta',
    class: 'Magnoliopsida',
    order: 'Rosales',
    family: 'Rosaceae',
    genus: 'Prunus',
    speciesName: 'Prunus persica',
    commonName: 'Peach',
    speciesDescription: 'A deciduous tree native to the region of Northwest China, known for its edible juicy fruit.',
    conservationStatus: 'LEAST_CONCERN',
    originCountry: 'East Asia',
    lightType: 'FULL_SUN',
    soilType: 'LOAMY',
    fertiliserType: 'Inorganic',
    images: [
      'https://www.bhg.com/thmb/kdYfB-oVtVF3Dz0yXMLi0wSdQ-s=/550x0/filters:no_upscale():strip_icc()/BHG116403-1d19cb363cc24ec79917ff58ce7ca122.jpg',
      'https://cdn.mos.cms.futurecdn.net/i4Eo3wqMZBECRSaoYdeG4i.jpg',
    ],
    waterRequirement: 35,
    fertiliserRequirement: 25,
    idealHumidity: 70,
    minTemp: 10,
    maxTemp: 40,
    idealTemp: 25,
    isDroughtTolerant: false,
    isFastGrowing: true,
    isSlowGrowing: false,
    isEdible: true,
    isDeciduous: true,
    isEvergreen: false,
    isToxic: false,
    isFragrant: false,
  },
  {
    phylum: 'Magnoliophyta',
    class: 'Magnoliopsida',
    order: 'Rosales',
    family: 'Fabaceae',
    genus: 'Sophora',
    speciesName: 'Sophora toromiro',
    commonName: 'Toromiro',
    speciesDescription: 'A species of flowering tree that was once native to Easter Island, now extinct in the wild.',
    conservationStatus: 'EXTINCT',
    originCountry: 'Pacific Islands',
    lightType: 'FULL_SUN',
    soilType: 'SANDY',
    fertiliserType: 'Organic',
    images: [
      'https://th-thumbnailer.cdn-si-edu.com/fEzgV_MvpE4eplk4gtNewcohBGo=/800x800/filters:focal(800x602:801x603)/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer_public/71/39/7139c237-06f9-4013-b1d4-fee47c2f4832/sophora_toromiro_2c_web.jpg',
      'https://d2seqvvyy3b8p2.cloudfront.net/da88ca8782a5fa28aa7d1cb85c071cb8.jpg',
    ],
    waterRequirement: 45,
    fertiliserRequirement: 25,
    idealHumidity: 55,
    minTemp: 5,
    maxTemp: 35,
    idealTemp: 22,
    isDroughtTolerant: true,
    isFastGrowing: false,
    isSlowGrowing: true,
    isEdible: false,
    isDeciduous: true,
    isEvergreen: false,
    isToxic: false,
    isFragrant: false,
  },
];

const occurrenceData = [
  {
    lat: 1.3521,
    lng: 103.8198,
    dateObserved: '2024-09-08T10:00:00Z',
    dateOfBirth: '2024-01-01T00:00:00Z',
    numberOfPlants: 10.0,
    biomass: 250.5,
    title: 'New Tree Observation',
    description: 'Observation of recently planted trees in the area',
    decarbonizationType: 'TREE_TROPICAL',
    speciesId: '',
    occurrenceStatus: 'HEALTHY',
    zoneId: 1,
    images: ['https://lepark.s3.ap-southeast-1.amazonaws.com/occurrence/occurrence-1.jpg'],
  },
  {
    lat: 1.353,
    lng: 103.8187,
    dateObserved: '2024-09-07T11:00:00Z',
    dateOfBirth: '2023-12-01T00:00:00Z',
    numberOfPlants: 8.0,
    biomass: 180.0,
    title: 'Shrub Observation',
    description: 'Observation of newly planted shrubs',
    decarbonizationType: 'SHRUB',
    speciesId: '',
    occurrenceStatus: 'NEEDS_ATTENTION',
    zoneId: 1,
    images: ['https://lepark.s3.ap-southeast-1.amazonaws.com/occurrence/occurrence-2.jpg'],
  },
  {
    lat: 1.3552,
    lng: 103.8175,
    dateObserved: '2024-09-06T09:30:00Z',
    dateOfBirth: '2024-02-15T00:00:00Z',
    numberOfPlants: 5.0,
    biomass: 120.3,
    title: 'Tropical Tree Growth',
    description: 'Monitoring the growth of tropical trees',
    decarbonizationType: 'TREE_TROPICAL',
    speciesId: '',
    occurrenceStatus: 'MONITOR_AFTER_TREATMENT',
    zoneId: 1,
    images: ['https://lepark.s3.ap-southeast-1.amazonaws.com/occurrence/occurrence-3.jpg'],
  },
  {
    lat: 1.3545,
    lng: 103.819,
    dateObserved: '2024-09-05T08:45:00Z',
    dateOfBirth: '2024-03-01T00:00:00Z',
    numberOfPlants: 12.0,
    biomass: 275.0,
    title: 'Mangrove Observation',
    description: 'Observation of newly planted mangroves',
    decarbonizationType: 'TREE_MANGROVE',
    speciesId: '',
    occurrenceStatus: 'HEALTHY',
    zoneId: 1,
    images: ['https://lepark.s3.ap-southeast-1.amazonaws.com/occurrence/occurrence-4.jpg'],
  },
  {
    lat: 1.351,
    lng: 103.8202,
    dateObserved: '2024-09-04T10:15:00Z',
    dateOfBirth: '2024-02-01T00:00:00Z',
    numberOfPlants: 9.0,
    biomass: 240.8,
    title: 'Tropical Tree Observation',
    description: 'Observing the progress of tropical trees',
    decarbonizationType: 'TREE_TROPICAL',
    speciesId: '',
    occurrenceStatus: 'MONITOR_AFTER_TREATMENT',
    zoneId: 1,
    images: ['https://lepark.s3.ap-southeast-1.amazonaws.com/occurrence/occurrence-5.jpg'],
  },
  {
    lat: 1.3525,
    lng: 103.821,
    dateObserved: '2024-09-03T09:00:00Z',
    dateOfBirth: '2023-11-25T00:00:00Z',
    numberOfPlants: 6.0,
    biomass: 160.2,
    title: 'Shrub Monitoring',
    description: 'Monitoring recently planted shrubs',
    decarbonizationType: 'SHRUB',
    speciesId: '',
    occurrenceStatus: 'HEALTHY',
    zoneId: 1,
    images: ['https://lepark.s3.ap-southeast-1.amazonaws.com/occurrence/occurrence-6.jpg'],
  },
  {
    lat: 1.36,
    lng: 103.829,
    dateObserved: '2024-09-02T12:30:00Z',
    dateOfBirth: '2024-01-15T00:00:00Z',
    numberOfPlants: 10.0,
    biomass: 300.0,
    title: 'Mangrove Growth Observation',
    description: 'Monitoring the growth of mangroves in the area',
    decarbonizationType: 'TREE_MANGROVE',
    speciesId: '',
    occurrenceStatus: 'NEEDS_ATTENTION',
    zoneId: 2,
    images: ['https://lepark.s3.ap-southeast-1.amazonaws.com/occurrence/occurrence-7.jpg'],
  },
  {
    lat: 1.3615,
    lng: 103.8275,
    dateObserved: '2024-09-01T11:00:00Z',
    dateOfBirth: '2023-10-10T00:00:00Z',
    numberOfPlants: 7.0,
    biomass: 210.0,
    title: 'Shrub Care Observation',
    description: 'Observation of shrubs requiring care',
    decarbonizationType: 'SHRUB',
    speciesId: '',
    occurrenceStatus: 'MONITOR_AFTER_TREATMENT',
    zoneId: 2,
    images: ['https://lepark.s3.ap-southeast-1.amazonaws.com/occurrence/occurrence-8.jpg'],
  },
  {
    lat: 1.362,
    lng: 103.825,
    dateObserved: '2024-08-31T14:00:00Z',
    dateOfBirth: '2024-02-10T00:00:00Z',
    numberOfPlants: 15.0,
    biomass: 350.5,
    title: 'Mangrove Area Observation',
    description: 'Observation of mangroves in the area',
    decarbonizationType: 'TREE_MANGROVE',
    speciesId: '',
    occurrenceStatus: 'HEALTHY',
    zoneId: 2,
    images: ['https://lepark.s3.ap-southeast-1.amazonaws.com/occurrence/occurrence-9.jpg'],
  },
  {
    lat: 1.366,
    lng: 103.831,
    dateObserved: '2024-08-30T13:45:00Z',
    dateOfBirth: '2023-12-20T00:00:00Z',
    numberOfPlants: 12.0,
    biomass: 280.2,
    title: 'Tree Growth Observation',
    description: 'Observation of tropical trees showing growth',
    decarbonizationType: 'TREE_TROPICAL',
    speciesId: '',
    occurrenceStatus: 'HEALTHY',
    zoneId: 3,
    images: ['https://lepark.s3.ap-southeast-1.amazonaws.com/occurrence/occurrence-10.jpeg'],
  },
  {
    lat: 1.3675,
    lng: 103.8335,
    dateObserved: '2024-08-29T10:30:00Z',
    dateOfBirth: '2024-01-10T00:00:00Z',
    numberOfPlants: 6.0,
    biomass: 170.5,
    title: 'Mangrove Monitoring',
    description: 'Monitoring the health of mangroves',
    decarbonizationType: 'TREE_MANGROVE',
    speciesId: '',
    occurrenceStatus: 'NEEDS_ATTENTION',
    zoneId: 3,
    images: ['https://lepark.s3.ap-southeast-1.amazonaws.com/occurrence/occurrence-11.jpg'],
  },
  {
    lat: 1.365,
    lng: 103.832,
    dateObserved: '2024-08-28T09:00:00Z',
    dateOfBirth: '2024-03-05T00:00:00Z',
    numberOfPlants: 9.0,
    biomass: 240.0,
    title: 'Tree Care Observation',
    description: 'Trees needing urgent care',
    decarbonizationType: 'TREE_TROPICAL',
    speciesId: '',
    occurrenceStatus: 'URGENT_ACTION_REQUIRED',
    zoneId: 3,
    images: ['https://lepark.s3.ap-southeast-1.amazonaws.com/occurrence/occurrence-1.jpg'],
  },
];

const staffData = [
  {
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@lepark.com',
    password: 'password',
    contactNumber: '89012345',
    role: 'SUPERADMIN',
    isActive: true,
    isFirstLogin: false,
  },
  {
    firstName: 'Jerry',
    lastName: 'Tan',
    email: 'manager1@lepark.com',
    password: 'password',
    contactNumber: '89012345',
    role: 'MANAGER',
    isActive: true,
    isFirstLogin: false,
    parkId: 1,
  },
  {
    firstName: 'Li Ting',
    lastName: 'Lim',
    email: 'botanist1@lepark.com',
    password: 'password',
    contactNumber: '89123456',
    role: 'BOTANIST',
    isActive: true,
    isFirstLogin: false,
    parkId: 1,
  },
  {
    firstName: 'Kai Jie',
    lastName: 'Wong',
    email: 'arborist1@lepark.com',
    password: 'password',
    contactNumber: '89234567',
    role: 'ARBORIST',
    isActive: true,
    isFirstLogin: false,
    parkId: 1,
  },
  {
    firstName: 'Ying Xuan',
    lastName: 'Teo',
    email: 'landscapearchitect1@lepark.com',
    password: 'password',
    contactNumber: '89345678',
    role: 'LANDSCAPE_ARCHITECT',
    isActive: true,
    isFirstLogin: false,
    parkId: 1,
  },
  {
    firstName: 'Zhi Hao',
    lastName: 'Tan',
    email: 'parkranger1@lepark.com',
    password: 'password',
    contactNumber: '89456789',
    role: 'PARK_RANGER',
    isActive: true,
    isFirstLogin: false,
    parkId: 1,
  },
  {
    firstName: 'Shu Hui',
    lastName: 'Ng',
    email: 'vendormanager1@lepark.com',
    password: 'password',
    contactNumber: '89567890',
    role: 'VENDOR_MANAGER',
    isActive: true,
    isFirstLogin: false,
    parkId: 1,
  },
  {
    firstName: 'Kenny',
    lastName: 'Loh',
    email: 'manager2@lepark.com',
    password: 'password',
    contactNumber: '89678901',
    role: 'MANAGER',
    isActive: true,
    isFirstLogin: false,
    parkId: 2,
  },
  {
    firstName: 'Mei Ling',
    lastName: 'Goh',
    email: 'botanist2@lepark.com',
    password: 'password',
    contactNumber: '89789012',
    role: 'BOTANIST',
    isActive: true,
    isFirstLogin: false,
    parkId: 2,
  },
  {
    firstName: 'Jia Le',
    lastName: 'Chong',
    email: 'arborist2@lepark.com',
    password: 'password',
    contactNumber: '89890123',
    role: 'ARBORIST',
    isActive: true,
    isFirstLogin: false,
    parkId: 2,
  },
  {
    firstName: 'Wei Qi',
    lastName: 'Lee',
    email: 'landscapearchitect2@lepark.com',
    password: 'password',
    contactNumber: '89901234',
    role: 'LANDSCAPE_ARCHITECT',
    isActive: true,
    isFirstLogin: false,
    parkId: 2,
  },
  {
    firstName: 'Jun Kai',
    lastName: 'Tan',
    email: 'parkranger2@lepark.com',
    password: 'password',
    contactNumber: '88912345',
    role: 'PARK_RANGER',
    isActive: true,
    isFirstLogin: false,
    parkId: 2,
  },
  {
    firstName: 'Xin Yi',
    lastName: 'Chew',
    email: 'vendormanager2@lepark.com',
    password: 'password',
    contactNumber: '88823456',
    role: 'VENDOR_MANAGER',
    isActive: true,
    isFirstLogin: false,
    parkId: 2,
  },
];

const activityLogsData = [
  {
    name: "Watered plant.",
    description: "Plant looks healthier.",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
    activityLogType: "WATERED",
    images: ['https://i0.wp.com/www.gardening4joy.com/wp-content/uploads/2020/01/capillary-main.jpg?resize=1024%2C768&ssl=1']
  },
  {
    name: "Harvesting Completed",
    description: "The mature plants were harvested for their fruits or leaves.",
    images: [],
    activityLogType: "HARVESTED",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Plant Staked for Support",
    description: "The plant was staked to provide additional support during growth.",
    images: [],
    activityLogType: "STAKED",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Mulched Around Base",
    description: "A layer of mulch was added around the base of the plants to retain moisture.",
    images: [],
    activityLogType: "MULCHED",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Plant Relocated",
    description: "The plant was moved to a new location within the garden for better sunlight.",
    images: [],
    activityLogType: "MOVED",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Routine Check",
    description: "A routine check was performed to monitor the plant’s overall health.",
    images: [],
    activityLogType: "CHECKED",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Compost Added",
    description: "Compost was added to the soil to enrich it with organic nutrients.",
    images: [],
    activityLogType: "ADDED_COMPOST",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Replanted into New Soil",
    description: "The plant was moved to a new location with fresh soil to improve growth.",
    images: [],
    activityLogType: "REPLANTED",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Health Check",
    description: "A thorough health check was performed to ensure no visible diseases or pests.",
    images: [],
    activityLogType: "CHECKED_HEALTH",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Pests Treated",
    description: "Pesticide treatment was applied to eliminate pests found on the plants.",
    images: [],
    activityLogType: "TREATED_PESTS",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Soil Replaced",
    description: "The soil was replaced with a nutrient-rich mixture to support plant growth.",
    images: [],
    activityLogType: "SOIL_REPLACED",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
]

const statusLogsData = [
  {
    name: "Initial Health Check",
    description: "The plants were checked during initial observation, showing no signs of distress.",
    images: [],
    statusLogType: "HEALTHY",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Fungal Infection Spotted",
    description: "A fungal infection has been detected on the leaves. Immediate treatment required.",
    images: [],
    statusLogType: "NEEDS_ATTENTION",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Signs of Overwatering",
    description: "The soil is waterlogged and the plant roots are showing signs of rot. Reduce watering frequency.",
    images: [],
    statusLogType: "NEEDS_ATTENTION",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Pest Infestation",
    description: "Aphids have been found on several plants. Recommend applying pest treatment.",
    images: [],
    statusLogType: "URGENT_ACTION_REQUIRED",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Recovery from Pests",
    description: "The plants are recovering well after pest treatment. Continue monitoring.",
    images: [],
    statusLogType: "MONITOR_AFTER_TREATMENT",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Nutrient Deficiency",
    description: "Leaves are turning yellow due to suspected nutrient deficiency. Apply fertilization.",
    images: [],
    statusLogType: "NEEDS_ATTENTION",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Root Damage Detected",
    description: "Root damage observed, possibly due to compacted soil. Consider replanting.",
    images: [],
    statusLogType: "URGENT_ACTION_REQUIRED",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Rechecking after Fertilization",
    description: "The plants have shown improvement after fertilization. Continue monitoring.",
    images: [],
    statusLogType: "MONITOR_AFTER_TREATMENT",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Healthy Growth Observed",
    description: "The plants are growing well with no visible issues. Healthy condition maintained.",
    images: [],
    statusLogType: "HEALTHY",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Drought Stress Detected",
    description: "Signs of wilting due to lack of water. Urgent irrigation required.",
    images: [],
    statusLogType: "URGENT_ACTION_REQUIRED",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Leaf Discoloration",
    description: "Leaves are discolored, likely due to environmental stress or poor soil nutrition.",
    images: [],
    statusLogType: "NEEDS_ATTENTION",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Plant Removed",
    description: "The plant has been removed from the site due to irrecoverable damage or decay.",
    images: [],
    statusLogType: "REMOVED",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
  {
    name: "Pest-Free After Treatment",
    description: "No more pests detected after treatment. Keep monitoring for any reappearance.",
    images: [],
    statusLogType: "MONITOR_AFTER_TREATMENT",
    dateCreated: "2024-09-16T10:30:00Z",
    occurrenceId: '',
  },
];

module.exports = {
  parksData,
  zonesData,
  speciesData,
  occurrenceData,
  staffData,
  activityLogsData,
  statusLogsData
};
