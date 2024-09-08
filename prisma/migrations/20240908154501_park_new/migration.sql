-- CreateEnum
CREATE TYPE "StaffRoleEnum" AS ENUM ('MANAGER', 'BOTANIST', 'ARBORIST', 'GARDENER', 'MAINTENANCE_WORKER', 'CLEANER', 'LANDSCAPE_ARCHITECT', 'PARK_RANGER');

-- CreateEnum
CREATE TYPE "ConservationStatusEnum" AS ENUM ('LEAST_CONCERN', 'NEAR_THREATENED', 'VULNERABLE', 'ENDANGERED', 'CRITICALLY_ENDANGERED', 'EXTINCT_IN__THE_WILD', 'EXTINCT');

-- CreateEnum
CREATE TYPE "LightTypeEnum" AS ENUM ('FULL_SUN', 'PARTIAL_SHADE', 'FULL_SHADE');

-- CreateEnum
CREATE TYPE "SoilTypeEnum" AS ENUM ('SANDY', 'CLAY', 'LOAM', 'PEATY', 'SILTY', 'CHALKY', 'SHALLOW');

-- CreateEnum
CREATE TYPE "DECARBONIZATION_TYPE" AS ENUM ('TREE_TROPICAL', 'TREE_MANGROVE', 'SHRUB');

-- CreateEnum
CREATE TYPE "ACTIVITY_LOG_TYPE" AS ENUM ('WATERED', 'TRIMMED', 'FERTILIZED', 'PRUNED', 'REPLANTED', 'CHECKED_HEALTH', 'TREATED_PESTS', 'SOIL_REPLACED', 'HARVESTED', 'STAKED', 'MULCHED', 'MOVED', 'CHECKED', 'ADDED_COMPOST', 'OTHERS');

-- CreateEnum
CREATE TYPE "OCCURRENCE_STATUS_ENUM" AS ENUM ('HEALTHY', 'NEEDS_ATTENTION', 'URGENT_ACTION_REQUIRED', 'REMOVED');

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
    "dateObserved" TIMESTAMP(3) NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "numberOfPlants" DOUBLE PRECISION NOT NULL,
    "biomass" DOUBLE PRECISION NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "decarbonizationType" "DECARBONIZATION_TYPE" NOT NULL,
    "speciesId" UUID NOT NULL,

    CONSTRAINT "Occurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "images" TEXT[],
    "activityLogType" "ACTIVITY_LOG_TYPE" NOT NULL,
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
    "statusLogType" "OCCURRENCE_STATUS_ENUM" NOT NULL,
    "occurrenceId" UUID NOT NULL,

    CONSTRAINT "StatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_email_key" ON "Visitor"("email");

-- AddForeignKey
ALTER TABLE "Occurrence" ADD CONSTRAINT "Occurrence_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusLog" ADD CONSTRAINT "StatusLog_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
