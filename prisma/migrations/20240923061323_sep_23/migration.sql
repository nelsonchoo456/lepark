/*
  Warnings:

  - The values [TREATED_PESTS] on the enum `ActivityLogTypeEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "PlantTaskStatusEnum" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PlantTaskTypeEnum" AS ENUM ('INSPECTION', 'WATERING', 'PRUNING_TRIMMING', 'PEST_MANAGEMENT', 'SOIL_MAINTENANCE', 'STAKING_SUPPORTING', 'DEBRIS_REMOVAL', 'ENVIRONMENTAL_ADJUSTMENT', 'OTHERS');

-- CreateEnum
CREATE TYPE "PlantTaskUrgencyEnum" AS ENUM ('IMMEDIATE', 'HIGH', 'NORMAL', 'LOW');

-- AlterEnum
BEGIN;
CREATE TYPE "ActivityLogTypeEnum_new" AS ENUM ('WATERED', 'TRIMMED', 'FERTILIZED', 'PRUNED', 'REPLANTED', 'CHECKED_HEALTH', 'PEST_MONITORING', 'SOIL_REPLACED', 'HARVESTED', 'STAKED', 'MULCHED', 'MOVED', 'CHECKED', 'ADDED_COMPOST', 'SHADE_ADJUSTMENT', 'PLANT_PROPAGATION', 'LIGHT_EXPOSURE_CHECK', 'WATERING_ADJUSTMENT', 'OTHERS');
ALTER TABLE "ActivityLog" ALTER COLUMN "activityLogType" TYPE "ActivityLogTypeEnum_new" USING ("activityLogType"::text::"ActivityLogTypeEnum_new");
ALTER TYPE "ActivityLogTypeEnum" RENAME TO "ActivityLogTypeEnum_old";
ALTER TYPE "ActivityLogTypeEnum_new" RENAME TO "ActivityLogTypeEnum";
DROP TYPE "ActivityLogTypeEnum_old";
COMMIT;

-- CreateTable
CREATE TABLE "PlantTask" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "taskStatus" "PlantTaskStatusEnum" NOT NULL,
    "taskType" "PlantTaskTypeEnum" NOT NULL,
    "taskUrgency" "PlantTaskUrgencyEnum" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "occurrenceId" UUID NOT NULL,
    "staffId" UUID,

    CONSTRAINT "PlantTask_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlantTask" ADD CONSTRAINT "PlantTask_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantTask" ADD CONSTRAINT "PlantTask_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
