/*
  Warnings:

  - You are about to drop the column `lastMaintenanceDate` on the `Hub` table. All the data in the column will be lost.
  - You are about to drop the column `lastMaintenanceDate` on the `ParkAsset` table. All the data in the column will be lost.
  - You are about to drop the column `lastMaintenanceDate` on the `Sensor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hub" DROP COLUMN "lastMaintenanceDate",
ADD COLUMN     "nextMaintenanceDates" TIMESTAMP(3)[];

-- AlterTable
ALTER TABLE "ParkAsset" DROP COLUMN "lastMaintenanceDate",
ADD COLUMN     "nextMaintenanceDates" TIMESTAMP(3)[];

-- AlterTable
ALTER TABLE "Sensor" DROP COLUMN "lastMaintenanceDate",
ADD COLUMN     "nextMaintenanceDates" TIMESTAMP(3)[];
