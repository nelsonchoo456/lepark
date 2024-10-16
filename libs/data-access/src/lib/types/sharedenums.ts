export enum OccurrenceStatusEnum {
  HEALTHY = 'HEALTHY',
  MONITOR_AFTER_TREATMENT = 'MONITOR_AFTER_TREATMENT',
  NEEDS_ATTENTION = 'NEEDS_ATTENTION',
  URGENT_ACTION_REQUIRED = 'URGENT_ACTION_REQUIRED',
  REMOVED = 'REMOVED',
}

export enum PlantTaskStatusEnum {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PlantTaskTypeEnum {
  INSPECTION = 'INSPECTION',
  WATERING = 'WATERING',
  PRUNING_TRIMMING = 'PRUNING_TRIMMING',
  PEST_MANAGEMENT = 'PEST_MANAGEMENT',
  SOIL_MAINTENANCE = 'SOIL_MAINTENANCE',
  STAKING_SUPPORTING = 'STAKING_SUPPORTING',
  DEBRIS_REMOVAL = 'DEBRIS_REMOVAL',
  ENVIRONMENTAL_ADJUSTMENT = 'ENVIRONMENTAL_ADJUSTMENT',
  OTHERS = 'OTHERS',
}

export enum PlantTaskUrgencyEnum {
  IMMEDIATE = 'IMMEDIATE',
  HIGH = 'HIGH',
  NORMAL = 'NORMAL',
  LOW = 'LOW',
}

export enum ParkAssetTypeEnum {
  PLANT_TOOL_AND_EQUIPMENT = 'PLANT_TOOL_AND_EQUIPMENT',
  HOSES_AND_PIPES = 'HOSES_AND_PIPES',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  LANDSCAPING = 'LANDSCAPING',
  GENERAL_TOOLS = 'GENERAL_TOOLS',
  SAFETY = 'SAFETY',
  DIGITAL = 'DIGITAL',
  EVENT = 'EVENT',
}

export enum ParkAssetStatusEnum {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export enum ParkAssetConditionEnum {
  EXCELLENT = 'EXCELLENT',
  FAIR = 'FAIR',
  POOR = 'POOR',
  DAMAGED = 'DAMAGED',
}

export enum HubStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export enum SensorTypeEnum {
  TEMPERATURE = 'TEMPERATURE',
  HUMIDITY = 'HUMIDITY',
  SOIL_MOISTURE = 'SOIL_MOISTURE',
  LIGHT = 'LIGHT',
  CAMERA = 'CAMERA',
}

export enum SensorStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export enum SensorUnitEnum {
  PERCENT = 'PERCENT',
  DEGREES_CELSIUS = 'DEGREES_CELSIUS',
  VOLUMETRIC_WATER_CONTENT = 'VOLUMETRIC_WATER_CONTENT',
  LUX = 'LUX',
  PAX = 'PAX',
  // Add other units as needed
}

export enum FacilityStatusEnum {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
}

export enum FacilityTypeEnum {
  TOILET = 'TOILET',
  PLAYGROUND = 'PLAYGROUND',
  INFORMATION = 'INFORMATION',
  CARPARK = 'CARPARK',
  ACCESSIBILITY = 'ACCESSIBILITY',
  STAGE = 'STAGE',
  WATER_FOUNTAIN = 'WATER_FOUNTAIN',
  PICNIC_AREA = 'PICNIC_AREA',
  BBQ_PIT = 'BBQ_PIT',
  CAMPING_AREA = 'CAMPING_AREA',
  AED = 'AED',
  FIRST_AID = 'FIRST_AID',
  AMPHITHEATER = 'AMPHITHEATER',
  GAZEBO = 'GAZEBO',
  STOREROOM = 'STOREROOM',
  OTHERS = 'OTHERS',
}

export enum DecarbonizationTypeEnum {
  TREE_TROPICAL = 'TREE_TROPICAL',
  TREE_MANGROVE = 'TREE_MANGROVE',
  SHRUB = 'SHRUB',
}

export enum ParkStatusEnum {
  OPEN = 'OPEN',
  UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
  LIMITED_ACCESS = 'LIMITED_ACCESS',
  CLOSED = 'CLOSED',
}

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

export enum ZoneStatusEnum {
  OPEN = 'OPEN',
  UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
  LIMITED_ACCESS = 'LIMITED_ACCESS',
  CLOSED = 'CLOSED',
}

export enum FAQStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED',
}

export enum FAQCategoryEnum {
  GENERAL = 'GENERAL',
  PARK_RULES = 'PARK_RULES',
  FACILITIES = 'FACILITIES',
  EVENTS = 'EVENTS',
  SAFETY = 'SAFETY',
  ACCESSIBILITY = 'ACCESSIBILITY',
  SERVICES = 'SERVICES',
  TICKETING = 'TICKETING',
  PARK_HISTORY = 'PARK_HISTORY',
  OTHER = 'OTHER',
}

export enum FeedbackCategoryEnum {
  FACILITIES = 'FACILITIES',
  SERVICES = 'SERVICES',
  STAFF = 'STAFF',
}

export enum FeedbackStatusEnum {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}
