-- CreateEnum
CREATE TYPE "StaffRoleEnum" AS ENUM ('MANAGER', 'BOTANIST', 'ARBORIST', 'LANDSCAPE_ARCHITECT', 'PARK_RANGER', 'VENDOR_MANAGER', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "ConservationStatusEnum" AS ENUM ('LEAST_CONCERN', 'NEAR_THREATENED', 'VULNERABLE', 'ENDANGERED', 'CRITICALLY_ENDANGERED', 'EXTINCT_IN_THE_WILD', 'EXTINCT');

-- CreateEnum
CREATE TYPE "LightTypeEnum" AS ENUM ('FULL_SUN', 'PARTIAL_SHADE', 'FULL_SHADE');

-- CreateEnum
CREATE TYPE "SoilTypeEnum" AS ENUM ('SANDY', 'CLAYEY', 'LOAMY');

-- CreateEnum
CREATE TYPE "DecarbonizationTypeEnum" AS ENUM ('TREE_TROPICAL', 'TREE_MANGROVE', 'SHRUB');

-- CreateEnum
CREATE TYPE "OccurrenceStatusEnum" AS ENUM ('HEALTHY', 'MONITOR_AFTER_TREATMENT', 'NEEDS_ATTENTION', 'URGENT_ACTION_REQUIRED', 'REMOVED');

-- CreateEnum
CREATE TYPE "ActivityLogTypeEnum" AS ENUM ('WATERED', 'TRIMMED', 'FERTILIZED', 'PRUNED', 'REPLANTED', 'CHECKED_HEALTH', 'PEST_MONITORING', 'SOIL_REPLACED', 'HARVESTED', 'STAKED', 'MULCHED', 'MOVED', 'CHECKED', 'ADDED_COMPOST', 'SHADE_ADJUSTMENT', 'PLANT_PROPAGATION', 'LIGHT_EXPOSURE_CHECK', 'WATERING_ADJUSTMENT', 'OTHERS');

-- CreateEnum
CREATE TYPE "AttractionStatusEnum" AS ENUM ('OPEN', 'CLOSED', 'UNDER_MAINTENANCE');

-- CreateEnum
CREATE TYPE "AttractionTicketCategoryEnum" AS ENUM ('ADULT', 'CHILD', 'SENIOR', 'STUDENT');

-- CreateEnum
CREATE TYPE "AttractionTicketNationalityEnum" AS ENUM ('LOCAL', 'STANDARD');

-- CreateEnum
CREATE TYPE "AttractionTicketStatusEnum" AS ENUM ('VALID', 'INVALID', 'USED');

-- CreateEnum
CREATE TYPE "EventStatusEnum" AS ENUM ('ONGOING', 'UPCOMING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventTypeEnum" AS ENUM ('WORKSHOP', 'EXHIBITION', 'GUIDED_TOUR', 'PERFORMANCE', 'TALK', 'COMPETITION', 'FESTIVAL', 'CONFERENCE');

-- CreateEnum
CREATE TYPE "EventSuitabilityEnum" AS ENUM ('ANYONE', 'FAMILIES_AND_FRIENDS', 'CHILDREN', 'NATURE_ENTHUSIASTS', 'PETS', 'FITNESS_ENTHUSIASTS');

-- CreateEnum
CREATE TYPE "EventTicketCategoryEnum" AS ENUM ('ADULT', 'CHILD', 'SENIOR', 'STUDENT');

-- CreateEnum
CREATE TYPE "EventTicketNationalityEnum" AS ENUM ('LOCAL', 'STANDARD');

-- CreateEnum
CREATE TYPE "EventTicketStatusEnum" AS ENUM ('VALID', 'INVALID', 'USED');

-- CreateEnum
CREATE TYPE "HubStatusEnum" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'DECOMMISSIONED');

-- CreateEnum
CREATE TYPE "SensorTypeEnum" AS ENUM ('TEMPERATURE', 'HUMIDITY', 'SOIL_MOISTURE', 'LIGHT', 'CAMERA');

-- CreateEnum
CREATE TYPE "SensorStatusEnum" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'DECOMMISSIONED');

-- CreateEnum
CREATE TYPE "SensorUnitEnum" AS ENUM ('PERCENT', 'DEGREES_CELSIUS', 'VOLUMETRIC_WATER_CONTENT', 'LUX', 'PAX');

-- CreateEnum
CREATE TYPE "ParkAssetTypeEnum" AS ENUM ('PLANT_TOOL_AND_EQUIPMENT', 'HOSES_AND_PIPES', 'INFRASTRUCTURE', 'LANDSCAPING', 'GENERAL_TOOLS', 'SAFETY', 'DIGITAL', 'EVENT');

-- CreateEnum
CREATE TYPE "ParkAssetStatusEnum" AS ENUM ('AVAILABLE', 'IN_USE', 'UNDER_MAINTENANCE', 'DECOMMISSIONED');

-- CreateEnum
CREATE TYPE "ParkAssetConditionEnum" AS ENUM ('EXCELLENT', 'FAIR', 'POOR', 'DAMAGED');

-- CreateEnum
CREATE TYPE "FacilityTypeEnum" AS ENUM ('TOILET', 'PLAYGROUND', 'INFORMATION', 'CARPARK', 'ACCESSIBILITY', 'STAGE', 'WATER_FOUNTAIN', 'PICNIC_AREA', 'BBQ_PIT', 'CAMPING_AREA', 'AED', 'FIRST_AID', 'AMPHITHEATER', 'GAZEBO', 'STOREROOM', 'OTHERS');

-- CreateEnum
CREATE TYPE "FacilityStatusEnum" AS ENUM ('OPEN', 'CLOSED', 'UNDER_MAINTENANCE');

-- CreateEnum
CREATE TYPE "PlantTaskStatusEnum" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PlantTaskTypeEnum" AS ENUM ('INSPECTION', 'WATERING', 'PRUNING_TRIMMING', 'PEST_MANAGEMENT', 'SOIL_MAINTENANCE', 'STAKING_SUPPORTING', 'DEBRIS_REMOVAL', 'ENVIRONMENTAL_ADJUSTMENT', 'OTHERS');

-- CreateEnum
CREATE TYPE "PlantTaskUrgencyEnum" AS ENUM ('IMMEDIATE', 'HIGH', 'NORMAL', 'LOW');

-- CreateEnum
CREATE TYPE "MaintenanceTaskStatusEnum" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaintenanceTaskTypeEnum" AS ENUM ('INSPECTION', 'CLEANING', 'REPAIR', 'PLUMBING', 'ELECTRICAL', 'HEAT_AND_AIR_CONDITIONING', 'CALIBRATION', 'SOFTWARE_UPDATE', 'HARDWARE_REPLACEMENT', 'TESTING', 'ASSET_RELOCATION', 'FIRE_SAFETY', 'SECURITY_CHECK', 'WASTE_MANAGEMENT', 'OTHERS');

-- CreateEnum
CREATE TYPE "MaintenanceTaskUrgencyEnum" AS ENUM ('IMMEDIATE', 'HIGH', 'NORMAL', 'LOW');

-- CreateEnum
CREATE TYPE "FeedbackCategoryEnum" AS ENUM ('FACILITIES', 'SERVICES', 'STAFF', 'SAFETY', 'CLEANLINESS', 'ACCESSIBILITY', 'EVENTS', 'WILDLIFE', 'OTHER');

-- CreateEnum
CREATE TYPE "FeedbackStatusEnum" AS ENUM ('PENDING', 'IN_PROGRESS', 'REJECTED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "PromotionStatus" AS ENUM ('ENABLED', 'DISABLED');

-- CreateEnum
CREATE TYPE "FAQStatusEnum" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FAQCategoryEnum" AS ENUM ('GENERAL', 'PARK_RULES', 'FACILITIES', 'EVENTS', 'SAFETY', 'ACCESSIBILITY', 'SERVICES', 'TICKETING', 'PARK_HISTORY', 'OTHER');

-- CreateEnum
CREATE TYPE "AnnouncementStatusEnum" AS ENUM ('UPCOMING', 'ACTIVE', 'INACTIVE', 'EXPIRED');

-- CreateTable
CREATE TABLE "Staff" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "role" "StaffRoleEnum" NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "parkId" INTEGER,
    "isFirstLogin" BOOLEAN NOT NULL,
    "resetTokenUsed" BOOLEAN NOT NULL DEFAULT false,
    "resetToken" TEXT,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Species" (
    "id" UUID NOT NULL,
    "phylum" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "order" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "genus" TEXT NOT NULL,
    "speciesName" TEXT NOT NULL,
    "commonName" TEXT NOT NULL,
    "speciesDescription" TEXT NOT NULL,
    "conservationStatus" "ConservationStatusEnum" NOT NULL,
    "originCountry" TEXT NOT NULL,
    "lightType" "LightTypeEnum" NOT NULL,
    "soilType" "SoilTypeEnum" NOT NULL,
    "fertiliserType" TEXT NOT NULL,
    "images" TEXT[],
    "soilMoisture" INTEGER NOT NULL,
    "fertiliserRequirement" INTEGER NOT NULL,
    "idealHumidity" DOUBLE PRECISION NOT NULL,
    "minTemp" DOUBLE PRECISION NOT NULL,
    "maxTemp" DOUBLE PRECISION NOT NULL,
    "idealTemp" DOUBLE PRECISION NOT NULL,
    "isDroughtTolerant" BOOLEAN NOT NULL,
    "isFastGrowing" BOOLEAN NOT NULL,
    "isSlowGrowing" BOOLEAN NOT NULL,
    "isEdible" BOOLEAN NOT NULL,
    "isDeciduous" BOOLEAN NOT NULL,
    "isEvergreen" BOOLEAN NOT NULL,
    "isToxic" BOOLEAN NOT NULL,
    "isFragrant" BOOLEAN NOT NULL,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Occurrence" (
    "id" UUID NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "title" TEXT NOT NULL,
    "dateObserved" TIMESTAMP(3) NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "numberOfPlants" DOUBLE PRECISION NOT NULL,
    "biomass" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "occurrenceStatus" "OccurrenceStatusEnum" NOT NULL,
    "decarbonizationType" "DecarbonizationTypeEnum" NOT NULL,
    "speciesId" UUID NOT NULL,
    "zoneId" INTEGER NOT NULL,
    "images" TEXT[],

    CONSTRAINT "Occurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "images" TEXT[],
    "activityLogType" "ActivityLogTypeEnum" NOT NULL,
    "occurrenceId" UUID NOT NULL,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusLog" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "images" TEXT[],
    "statusLogType" "OccurrenceStatusEnum" NOT NULL,
    "occurrenceId" UUID NOT NULL,

    CONSTRAINT "StatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attraction" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "openingHours" TIMESTAMP(3)[],
    "closingHours" TIMESTAMP(3)[],
    "images" TEXT[],
    "status" "AttractionStatusEnum" NOT NULL,
    "ticketingPolicy" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "parkId" INTEGER NOT NULL,

    CONSTRAINT "Attraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttractionTicketListing" (
    "id" UUID NOT NULL,
    "category" "AttractionTicketCategoryEnum" NOT NULL,
    "nationality" "AttractionTicketNationalityEnum" NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "attractionId" UUID NOT NULL,

    CONSTRAINT "AttractionTicketListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttractionTicket" (
    "id" UUID NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" "AttractionTicketStatusEnum" NOT NULL,
    "attractionTicketListingId" UUID NOT NULL,
    "attractionTicketTransactionId" UUID NOT NULL,

    CONSTRAINT "AttractionTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttractionTicketTransaction" (
    "id" UUID NOT NULL,
    "attractionDate" TIMESTAMP(3) NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "visitorId" UUID NOT NULL,
    "attractionId" UUID NOT NULL,

    CONSTRAINT "AttractionTicketTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "EventTypeEnum" NOT NULL,
    "suitability" "EventSuitabilityEnum" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "ticketingPolicy" TEXT NOT NULL,
    "images" TEXT[],
    "status" "EventStatusEnum" NOT NULL,
    "facilityId" UUID NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTicketListing" (
    "id" UUID NOT NULL,
    "category" "EventTicketCategoryEnum" NOT NULL,
    "nationality" "EventTicketNationalityEnum" NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "eventId" UUID NOT NULL,

    CONSTRAINT "EventTicketListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTicket" (
    "id" UUID NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" "EventTicketStatusEnum" NOT NULL,
    "eventTicketListingId" UUID NOT NULL,
    "eventTicketTransactionId" UUID NOT NULL,

    CONSTRAINT "EventTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTicketTransaction" (
    "id" UUID NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "visitorId" UUID NOT NULL,
    "eventId" UUID NOT NULL,

    CONSTRAINT "EventTicketTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL,
    "resetToken" TEXT,
    "resetTokenUsed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hub" (
    "id" UUID NOT NULL,
    "identifierNumber" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hubStatus" "HubStatusEnum" NOT NULL,
    "acquisitionDate" TIMESTAMP(3) NOT NULL,
    "lastMaintenanceDate" TIMESTAMP(3),
    "nextMaintenanceDate" TIMESTAMP(3),
    "dataTransmissionInterval" INTEGER,
    "supplier" TEXT NOT NULL,
    "supplierContactNumber" TEXT NOT NULL,
    "ipAddress" TEXT,
    "macAddress" TEXT,
    "radioGroup" INTEGER,
    "hubSecret" TEXT,
    "images" TEXT[],
    "lat" DOUBLE PRECISION,
    "long" DOUBLE PRECISION,
    "remarks" TEXT,
    "zoneId" INTEGER,
    "facilityId" UUID,
    "lastDataUpdateDate" TIMESTAMP(3),

    CONSTRAINT "Hub_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sensor" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "identifierNumber" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "sensorType" "SensorTypeEnum" NOT NULL,
    "description" TEXT,
    "sensorStatus" "SensorStatusEnum" NOT NULL,
    "acquisitionDate" TIMESTAMP(3) NOT NULL,
    "lastMaintenanceDate" TIMESTAMP(3),
    "nextMaintenanceDate" TIMESTAMP(3),
    "sensorUnit" "SensorUnitEnum" NOT NULL,
    "supplier" TEXT NOT NULL,
    "supplierContactNumber" TEXT NOT NULL,
    "images" TEXT[],
    "lat" DOUBLE PRECISION,
    "long" DOUBLE PRECISION,
    "remarks" TEXT,
    "hubId" UUID,
    "facilityId" UUID,

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorReading" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "sensorId" UUID NOT NULL,

    CONSTRAINT "SensorReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkAsset" (
    "id" UUID NOT NULL,
    "identifierNumber" TEXT NOT NULL,
    "serialNumber" TEXT,
    "name" TEXT NOT NULL,
    "parkAssetType" "ParkAssetTypeEnum" NOT NULL,
    "description" TEXT,
    "parkAssetStatus" "ParkAssetStatusEnum" NOT NULL,
    "acquisitionDate" TIMESTAMP(3) NOT NULL,
    "lastMaintenanceDate" TIMESTAMP(3),
    "nextMaintenanceDate" TIMESTAMP(3),
    "supplier" TEXT NOT NULL,
    "supplierContactNumber" TEXT NOT NULL,
    "parkAssetCondition" "ParkAssetConditionEnum" NOT NULL,
    "images" TEXT[],
    "remarks" TEXT,
    "facilityId" UUID NOT NULL,

    CONSTRAINT "ParkAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceHistory" (
    "id" UUID NOT NULL,
    "hubId" UUID,
    "sensorId" UUID,
    "assetId" UUID,
    "maintenanceDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "MaintenanceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isBookable" BOOLEAN NOT NULL,
    "isPublic" BOOLEAN NOT NULL,
    "isSheltered" BOOLEAN NOT NULL,
    "facilityType" "FacilityTypeEnum" NOT NULL,
    "reservationPolicy" TEXT NOT NULL,
    "rulesAndRegulations" TEXT NOT NULL,
    "images" TEXT[],
    "lastMaintenanceDate" TIMESTAMP(3) NOT NULL,
    "openingHours" TIMESTAMP(3)[],
    "closingHours" TIMESTAMP(3)[],
    "facilityStatus" "FacilityStatusEnum" NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "long" DOUBLE PRECISION NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,
    "parkId" INTEGER NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantTask" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "taskStatus" "PlantTaskStatusEnum" NOT NULL,
    "taskType" "PlantTaskTypeEnum" NOT NULL,
    "taskUrgency" "PlantTaskUrgencyEnum" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "images" TEXT[],
    "remarks" TEXT,
    "occurrenceId" UUID NOT NULL,
    "assignedStaffId" UUID,
    "submittingStaffId" UUID NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "PlantTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceTask" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "taskStatus" "MaintenanceTaskStatusEnum" NOT NULL,
    "taskType" "MaintenanceTaskTypeEnum" NOT NULL,
    "taskUrgency" "MaintenanceTaskUrgencyEnum" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "images" TEXT[],
    "remarks" TEXT,
    "assignedStaffId" UUID,
    "submittingStaffId" UUID NOT NULL,
    "facilityId" UUID,
    "parkAssetId" UUID,
    "sensorId" UUID,
    "hubId" UUID,
    "position" INTEGER NOT NULL,

    CONSTRAINT "MaintenanceTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecarbonizationArea" (
    "id" UUID NOT NULL,
    "geom" TEXT NOT NULL,
    "description" TEXT,
    "name" TEXT NOT NULL,
    "parkId" INTEGER NOT NULL,

    CONSTRAINT "DecarbonizationArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SequestrationHistory" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "seqValue" DOUBLE PRECISION NOT NULL,
    "decarbonizationAreaId" UUID NOT NULL,

    CONSTRAINT "SequestrationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" UUID NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateResolved" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "feedbackCategory" "FeedbackCategoryEnum" NOT NULL,
    "images" TEXT[],
    "feedbackStatus" "FeedbackStatusEnum" NOT NULL,
    "remarks" TEXT,
    "parkId" INTEGER NOT NULL,
    "staffId" UUID,
    "visitorId" UUID NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "DiscountType" NOT NULL,
    "promoCode" TEXT,
    "isNParksWide" BOOLEAN NOT NULL,
    "parkId" INTEGER,
    "images" TEXT[],
    "discountValue" DOUBLE PRECISION NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "status" "PromotionStatus" NOT NULL,
    "terms" TEXT[],
    "maximumUsage" INTEGER,
    "minimumAmount" DOUBLE PRECISION,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" UUID NOT NULL,
    "category" "FAQCategoryEnum" NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "status" "FAQStatusEnum" NOT NULL,
    "parkId" INTEGER,
    "priority" INTEGER,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "AnnouncementStatusEnum" NOT NULL,
    "parkId" INTEGER,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_VisitorfavoriteSpecies" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_VisitorPromotionsRedeemed" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Species_speciesName_key" ON "Species"("speciesName");

-- CreateIndex
CREATE INDEX "Occurrence_zoneId_idx" ON "Occurrence"("zoneId");

-- CreateIndex
CREATE INDEX "Attraction_parkId_idx" ON "Attraction"("parkId");

-- CreateIndex
CREATE INDEX "Event_facilityId_idx" ON "Event"("facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_email_key" ON "Visitor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Hub_identifierNumber_key" ON "Hub"("identifierNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Hub_serialNumber_key" ON "Hub"("serialNumber");

-- CreateIndex
CREATE INDEX "Hub_zoneId_idx" ON "Hub"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_identifierNumber_key" ON "Sensor"("identifierNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_serialNumber_key" ON "Sensor"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ParkAsset_identifierNumber_key" ON "ParkAsset"("identifierNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ParkAsset_serialNumber_key" ON "ParkAsset"("serialNumber");

-- CreateIndex
CREATE INDEX "Facility_parkId_idx" ON "Facility"("parkId");

-- CreateIndex
CREATE INDEX "FAQ_parkId_idx" ON "FAQ"("parkId");

-- CreateIndex
CREATE UNIQUE INDEX "_VisitorfavoriteSpecies_AB_unique" ON "_VisitorfavoriteSpecies"("A", "B");

-- CreateIndex
CREATE INDEX "_VisitorfavoriteSpecies_B_index" ON "_VisitorfavoriteSpecies"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_VisitorPromotionsRedeemed_AB_unique" ON "_VisitorPromotionsRedeemed"("A", "B");

-- CreateIndex
CREATE INDEX "_VisitorPromotionsRedeemed_B_index" ON "_VisitorPromotionsRedeemed"("B");

-- AddForeignKey
ALTER TABLE "Occurrence" ADD CONSTRAINT "Occurrence_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusLog" ADD CONSTRAINT "StatusLog_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttractionTicketListing" ADD CONSTRAINT "AttractionTicketListing_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "Attraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttractionTicket" ADD CONSTRAINT "AttractionTicket_attractionTicketTransactionId_fkey" FOREIGN KEY ("attractionTicketTransactionId") REFERENCES "AttractionTicketTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttractionTicketTransaction" ADD CONSTRAINT "AttractionTicketTransaction_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicketListing" ADD CONSTRAINT "EventTicketListing_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicket" ADD CONSTRAINT "EventTicket_eventTicketTransactionId_fkey" FOREIGN KEY ("eventTicketTransactionId") REFERENCES "EventTicketTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicketTransaction" ADD CONSTRAINT "EventTicketTransaction_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hub" ADD CONSTRAINT "Hub_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorReading" ADD CONSTRAINT "SensorReading_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkAsset" ADD CONSTRAINT "ParkAsset_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceHistory" ADD CONSTRAINT "MaintenanceHistory_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceHistory" ADD CONSTRAINT "MaintenanceHistory_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceHistory" ADD CONSTRAINT "MaintenanceHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "ParkAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantTask" ADD CONSTRAINT "PlantTask_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantTask" ADD CONSTRAINT "PlantTask_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantTask" ADD CONSTRAINT "PlantTask_submittingStaffId_fkey" FOREIGN KEY ("submittingStaffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTask" ADD CONSTRAINT "MaintenanceTask_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTask" ADD CONSTRAINT "MaintenanceTask_submittingStaffId_fkey" FOREIGN KEY ("submittingStaffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTask" ADD CONSTRAINT "MaintenanceTask_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTask" ADD CONSTRAINT "MaintenanceTask_parkAssetId_fkey" FOREIGN KEY ("parkAssetId") REFERENCES "ParkAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTask" ADD CONSTRAINT "MaintenanceTask_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTask" ADD CONSTRAINT "MaintenanceTask_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SequestrationHistory" ADD CONSTRAINT "SequestrationHistory_decarbonizationAreaId_fkey" FOREIGN KEY ("decarbonizationAreaId") REFERENCES "DecarbonizationArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VisitorfavoriteSpecies" ADD CONSTRAINT "_VisitorfavoriteSpecies_A_fkey" FOREIGN KEY ("A") REFERENCES "Species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VisitorfavoriteSpecies" ADD CONSTRAINT "_VisitorfavoriteSpecies_B_fkey" FOREIGN KEY ("B") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VisitorPromotionsRedeemed" ADD CONSTRAINT "_VisitorPromotionsRedeemed_A_fkey" FOREIGN KEY ("A") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VisitorPromotionsRedeemed" ADD CONSTRAINT "_VisitorPromotionsRedeemed_B_fkey" FOREIGN KEY ("B") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
