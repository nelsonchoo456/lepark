/*
  Warnings:

  - A unique constraint covering the columns `[serialNumber]` on the table `Sensor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serialNumber` to the `Sensor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ParkAsset" ALTER COLUMN "lastMaintenanceDate" DROP NOT NULL,
ALTER COLUMN "nextMaintenanceDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Sensor" ADD COLUMN     "serialNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_serialNumber_key" ON "Sensor"("serialNumber");
