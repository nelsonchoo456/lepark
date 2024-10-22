/*
  Warnings:

  - You are about to drop the column `lastMaintenanceDate` on the `Hub` table. All the data in the column will be lost.
  - The `nextMaintenanceDate` column on the `Hub` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `lastMaintenanceDate` on the `ParkAsset` table. All the data in the column will be lost.
  - You are about to drop the column `lastMaintenanceDate` on the `Sensor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hub" DROP COLUMN "lastMaintenanceDate",
DROP COLUMN "nextMaintenanceDate",
ADD COLUMN     "nextMaintenanceDate" TIMESTAMP(3)[];

-- AlterTable
ALTER TABLE "ParkAsset" DROP COLUMN "lastMaintenanceDate";

-- AlterTable
ALTER TABLE "Sensor" DROP COLUMN "lastMaintenanceDate";
