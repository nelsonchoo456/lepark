/*
  Warnings:

  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UsageMetrics` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[serialNumber]` on the table `Sensor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dueDate` to the `PlantTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `acquisitionDate` to the `Sensor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `calibrationFrequencyDays` to the `Sensor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataFrequencyMinutes` to the `Sensor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recurringMaintenanceDuration` to the `Sensor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sensorName` to the `Sensor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sensorStatus` to the `Sensor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sensorType` to the `Sensor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sensorUnit` to the `Sensor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serialNumber` to the `Sensor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplier` to the `Sensor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierContactNumber` to the `Sensor` table without a default value. This is not possible if the table is not empty.

*/
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

-- DropForeignKey
ALTER TABLE "CalibrationHistory" DROP CONSTRAINT "CalibrationHistory_hubId_fkey";

-- DropForeignKey
ALTER TABLE "MaintenanceHistory" DROP CONSTRAINT "MaintenanceHistory_assetId_fkey";

-- DropForeignKey
ALTER TABLE "UsageMetrics" DROP CONSTRAINT "UsageMetrics_hubId_fkey";

-- DropForeignKey
ALTER TABLE "UsageMetrics" DROP CONSTRAINT "UsageMetrics_sensorId_fkey";

-- AlterTable
ALTER TABLE "Hub" ALTER COLUMN "nextMaintenanceDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PlantTask" ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Sensor" ADD COLUMN     "acquisitionDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "calibrationFrequencyDays" INTEGER NOT NULL,
ADD COLUMN     "dataFrequencyMinutes" INTEGER NOT NULL,
ADD COLUMN     "facilityId" UUID,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "lastCalibratedDate" TIMESTAMP(3),
ADD COLUMN     "lastMaintenanceDate" TIMESTAMP(3),
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "nextMaintenanceDate" TIMESTAMP(3),
ADD COLUMN     "recurringMaintenanceDuration" INTEGER NOT NULL,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "sensorDescription" TEXT,
ADD COLUMN     "sensorName" TEXT NOT NULL,
ADD COLUMN     "sensorStatus" "SensorStatusEnum" NOT NULL,
ADD COLUMN     "sensorType" "SensorTypeEnum" NOT NULL,
ADD COLUMN     "sensorUnit" "SensorUnitEnum" NOT NULL,
ADD COLUMN     "serialNumber" TEXT NOT NULL,
ADD COLUMN     "supplier" TEXT NOT NULL,
ADD COLUMN     "supplierContactNumber" TEXT NOT NULL;

-- DropTable
DROP TABLE "Asset";

-- DropTable
DROP TABLE "UsageMetrics";

-- CreateTable
CREATE TABLE "ParkAsset" (
    "id" UUID NOT NULL,
    "parkAssetName" TEXT NOT NULL,
    "parkAssetType" "ParkAssetTypeEnum" NOT NULL,
    "parkAssetDescription" TEXT,
    "parkAssetStatus" "ParkAssetStatusEnum" NOT NULL,
    "acquisitionDate" TIMESTAMP(3) NOT NULL,
    "recurringMaintenanceDuration" INTEGER NOT NULL,
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
CREATE TABLE "DecarbonizationArea" (
    "id" UUID NOT NULL,
    "geom" TEXT NOT NULL,
    "description" TEXT,
    "name" TEXT NOT NULL,

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

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_serialNumber_key" ON "Sensor"("serialNumber");

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkAsset" ADD CONSTRAINT "ParkAsset_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceHistory" ADD CONSTRAINT "MaintenanceHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "ParkAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SequestrationHistory" ADD CONSTRAINT "SequestrationHistory_decarbonizationAreaId_fkey" FOREIGN KEY ("decarbonizationAreaId") REFERENCES "DecarbonizationArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
