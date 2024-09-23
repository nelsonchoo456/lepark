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
CREATE TYPE "ActivityLogTypeEnum" AS ENUM ('WATERED', 'TRIMMED', 'FERTILIZED', 'PRUNED', 'REPLANTED', 'CHECKED_HEALTH', 'TREATED_PESTS', 'SOIL_REPLACED', 'HARVESTED', 'STAKED', 'MULCHED', 'MOVED', 'CHECKED', 'ADDED_COMPOST', 'OTHERS');

-- CreateEnum
CREATE TYPE "AttractionStatusEnum" AS ENUM ('OPEN', 'CLOSED', 'UNDER_MAINTENANCE');

-- CreateEnum
CREATE TYPE "HubStatusEnum" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'DECOMMISSIONED');

-- CreateEnum
CREATE TYPE "SensorTypeEnum" AS ENUM ('TEMPERATURE', 'HUMIDITY', 'SOIL_MOISTURE', 'LIGHT', 'CAMERA');

-- CreateEnum
CREATE TYPE "SensorStatusEnum" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'DECOMMISSIONED');

-- CreateEnum
CREATE TYPE "SensorUnitEnum" AS ENUM ('PERCENT', 'DEGREES_CELSIUS', 'VOLUMETRIC_WATER_CONTENT', 'LUX', 'PAX');

-- CreateEnum
CREATE TYPE "ParkAssetTypeEnum" AS ENUM ('EQUIPMENT_RELATED', 'PLANT_RELATED', 'PLANT_TOOL');

-- CreateEnum
CREATE TYPE "ParkAssetStatusEnum" AS ENUM ('AVAILABLE', 'IN_USE', 'UNDER_MAINTENANCE', 'DECOMMISSIONED');

-- CreateEnum
CREATE TYPE "ParkAssetConditionEnum" AS ENUM ('EXCELLENT', 'FAIR', 'POOR', 'DAMAGED');

-- CreateEnum
CREATE TYPE "FacilityTypeEnum" AS ENUM ('TOILET', 'PLAYGROUND', 'INFORMATION', 'CARPARK', 'ACCESSIBILITY', 'STAGE', 'WATER_FOUNTAIN', 'PICNIC_AREA', 'BBQ_PIT', 'CAMPING_AREA', 'AED', 'FIRST_AID', 'AMPHITHEATER', 'GAZEBO', 'STOREROOM', 'OTHERS');

-- CreateEnum
CREATE TYPE "FacilityStatusEnum" AS ENUM ('OPEN', 'CLOSED', 'MAINTENANCE');

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
    "waterRequirement" INTEGER NOT NULL,
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
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "parkId" INTEGER NOT NULL,

    CONSTRAINT "Attraction_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hub" (
    "id" UUID NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hubStatus" "HubStatusEnum" NOT NULL,
    "acquisitionDate" TIMESTAMP(3) NOT NULL,
    "recommendedCalibrationFrequencyDays" INTEGER NOT NULL,
    "recommendedMaintenanceDuration" INTEGER NOT NULL,
    "nextMaintenanceDate" TIMESTAMP(3),
    "dataTransmissionInterval" DOUBLE PRECISION NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "macAddress" TEXT NOT NULL,
    "radioGroup" INTEGER NOT NULL,
    "hubSecret" TEXT NOT NULL,
    "images" TEXT[],
    "lat" DOUBLE PRECISION,
    "long" DOUBLE PRECISION,
    "remarks" TEXT,
    "zoneId" INTEGER,
    "facilityId" UUID,

    CONSTRAINT "Hub_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sensor" (
    "id" UUID NOT NULL,
    "sensorName" TEXT NOT NULL,
    "sensorType" "SensorTypeEnum" NOT NULL,
    "sensorDescription" TEXT,
    "sensorStatus" "SensorStatusEnum" NOT NULL,
    "acquisitionDate" TIMESTAMP(3) NOT NULL,
    "lastCalibratedDate" TIMESTAMP(3),
    "calibrationFrequencyDays" INTEGER NOT NULL,
    "recurringMaintenanceDuration" INTEGER NOT NULL,
    "lastMaintenanceDate" TIMESTAMP(3),
    "nextMaintenanceDate" TIMESTAMP(3),
    "dataFrequencyMinutes" INTEGER NOT NULL,
    "sensorUnit" "SensorUnitEnum" NOT NULL,
    "supplier" TEXT NOT NULL,
    "supplierContactNumber" TEXT NOT NULL,
    "image" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "remarks" TEXT,
    "hubId" UUID,
    "facilityId" UUID,

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkAsset" (
    "id" UUID NOT NULL,
    "parkAssetName" TEXT NOT NULL,
    "parkAssetType" "ParkAssetTypeEnum" NOT NULL,
    "parkAssetDescription" TEXT,
    "parkAssetStatus" "ParkAssetStatusEnum" NOT NULL,
    "acquisitionDate" TIMESTAMP(3) NOT NULL,
    "recurringMaintenanceDuration" INTEGER NOT NULL,
    "lastMaintenanceDate" TIMESTAMP(3) NOT NULL,
    "nextMaintenanceDate" TIMESTAMP(3) NOT NULL,
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
CREATE TABLE "CalibrationHistory" (
    "id" UUID NOT NULL,
    "hubId" UUID,
    "sensorId" UUID,
    "calibrationDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "CalibrationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" UUID NOT NULL,
    "facilityName" TEXT NOT NULL,
    "facilityDescription" TEXT NOT NULL,
    "isBookable" BOOLEAN NOT NULL,
    "isPublic" BOOLEAN NOT NULL,
    "isSheltered" BOOLEAN NOT NULL,
    "facilityType" "FacilityTypeEnum" NOT NULL,
    "reservationPolicy" TEXT NOT NULL,
    "rulesAndRegulations" TEXT NOT NULL,
    "images" TEXT[],
    "lastMaintenanceDate" TIMESTAMP(3) NOT NULL,
    "nextMaintenanceDate" TIMESTAMP(3) NOT NULL,
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
CREATE TABLE "_VisitorfavoriteSpecies" (
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
CREATE UNIQUE INDEX "Visitor_email_key" ON "Visitor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Hub_serialNumber_key" ON "Hub"("serialNumber");

-- CreateIndex
CREATE INDEX "Hub_zoneId_idx" ON "Hub"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "_VisitorfavoriteSpecies_AB_unique" ON "_VisitorfavoriteSpecies"("A", "B");

-- CreateIndex
CREATE INDEX "_VisitorfavoriteSpecies_B_index" ON "_VisitorfavoriteSpecies"("B");

-- AddForeignKey
ALTER TABLE "Occurrence" ADD CONSTRAINT "Occurrence_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusLog" ADD CONSTRAINT "StatusLog_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hub" ADD CONSTRAINT "Hub_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkAsset" ADD CONSTRAINT "ParkAsset_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceHistory" ADD CONSTRAINT "MaintenanceHistory_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceHistory" ADD CONSTRAINT "MaintenanceHistory_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceHistory" ADD CONSTRAINT "MaintenanceHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "ParkAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationHistory" ADD CONSTRAINT "CalibrationHistory_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VisitorfavoriteSpecies" ADD CONSTRAINT "_VisitorfavoriteSpecies_A_fkey" FOREIGN KEY ("A") REFERENCES "Species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VisitorfavoriteSpecies" ADD CONSTRAINT "_VisitorfavoriteSpecies_B_fkey" FOREIGN KEY ("B") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
