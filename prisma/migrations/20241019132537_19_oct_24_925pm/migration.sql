-- CreateEnum
CREATE TYPE "MaintenanceTaskStatusEnum" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaintenanceTaskTypeEnum" AS ENUM ('INSPECTION', 'CLEANING', 'REPAIR', 'PLUMBING', 'ELECTRICAL', 'HEAT_AND_AIR_CONDITIONING', 'CALIBRATION', 'SOFTWARE_UPDATE', 'HARDWARE_REPLACEMENT', 'TESTING', 'ASSET_RELOCATION', 'FIRE_SAFETY', 'SECURITY_CHECK', 'WASTE_MANAGEMENT', 'OTHERS');

-- CreateEnum
CREATE TYPE "MaintenanceTaskUrgencyEnum" AS ENUM ('IMMEDIATE', 'HIGH', 'NORMAL', 'LOW');

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
