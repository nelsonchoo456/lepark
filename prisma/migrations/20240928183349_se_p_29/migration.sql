/*
  Warnings:

  - The values [EQUIPMENT_RELATED,PLANT_RELATED,PLANT_TOOL] on the enum `ParkAssetTypeEnum` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `recurringMaintenanceDuration` on the `ParkAsset` table. All the data in the column will be lost.
  - You are about to drop the column `recurringMaintenanceDuration` on the `Sensor` table. All the data in the column will be lost.
  - Added the required column `supplier` to the `Hub` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierContactNumber` to the `Hub` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ParkAssetTypeEnum_new" AS ENUM ('PLANT_TOOL_AND_EQUIPMENT', 'HOSES_AND_PIPES', 'INFRASTRUCTURE', 'LANDSCAPING', 'GENERAL_TOOLS', 'SAFETY', 'DIGITAL', 'EVENT');
ALTER TABLE "ParkAsset" ALTER COLUMN "parkAssetType" TYPE "ParkAssetTypeEnum_new" USING ("parkAssetType"::text::"ParkAssetTypeEnum_new");
ALTER TYPE "ParkAssetTypeEnum" RENAME TO "ParkAssetTypeEnum_old";
ALTER TYPE "ParkAssetTypeEnum_new" RENAME TO "ParkAssetTypeEnum";
DROP TYPE "ParkAssetTypeEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "Hub" ADD COLUMN     "lastMaintenanceDate" TIMESTAMP(3),
ADD COLUMN     "supplier" TEXT NOT NULL,
ADD COLUMN     "supplierContactNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ParkAsset" DROP COLUMN "recurringMaintenanceDuration";

-- AlterTable
ALTER TABLE "Sensor" DROP COLUMN "recurringMaintenanceDuration",
ALTER COLUMN "calibrationFrequencyDays" DROP NOT NULL,
ALTER COLUMN "dataFrequencyMinutes" DROP NOT NULL,
ALTER COLUMN "sensorUnit" DROP NOT NULL;
