-- CreateEnum
CREATE TYPE "DECARBONIZATION_TYPE" AS ENUM ('TREE_TROPICAL', 'TREE_MANGROVE', 'SHRUB');

-- CreateEnum
CREATE TYPE "ACTIVITY_LOG_TYPE" AS ENUM ('WATERED', 'TRIMMED', 'FERTILIZED', 'PRUNED', 'REPLANTED', 'CHECKED_HEALTH', 'TREATED_PESTS', 'SOIL_REPLACED', 'HARVESTED', 'STAKED', 'MULCHED', 'MOVED', 'CHECKED', 'ADDED_COMPOST', 'OTHERS');

-- CreateEnum
CREATE TYPE "OCCURRENCE_STATUS_ENUM" AS ENUM ('HEALTHY', 'NEEDS_ATTENTION', 'URGENT_ACTION_REQUIRED', 'REMOVED');

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
    "occurenceId" UUID NOT NULL,

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
    "occurenceId" UUID NOT NULL,

    CONSTRAINT "StatusLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Occurrence" ADD CONSTRAINT "Occurrence_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_occurenceId_fkey" FOREIGN KEY ("occurenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusLog" ADD CONSTRAINT "StatusLog_occurenceId_fkey" FOREIGN KEY ("occurenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
