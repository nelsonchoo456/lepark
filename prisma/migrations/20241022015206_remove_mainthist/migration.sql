/*
  Warnings:

  - You are about to drop the `MaintenanceHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MaintenanceHistory" DROP CONSTRAINT "MaintenanceHistory_assetId_fkey";

-- DropForeignKey
ALTER TABLE "MaintenanceHistory" DROP CONSTRAINT "MaintenanceHistory_hubId_fkey";

-- DropForeignKey
ALTER TABLE "MaintenanceHistory" DROP CONSTRAINT "MaintenanceHistory_sensorId_fkey";

-- DropTable
DROP TABLE "MaintenanceHistory";
