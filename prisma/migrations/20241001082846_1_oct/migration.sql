/*
  Warnings:

  - A unique constraint covering the columns `[identifierNumber]` on the table `Hub` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifierNumber]` on the table `ParkAsset` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identifierNumber]` on the table `Sensor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identifierNumber` to the `Hub` table without a default value. This is not possible if the table is not empty.
  - Added the required column `identifierNumber` to the `ParkAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `identifierNumber` to the `Sensor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Hub" ADD COLUMN     "identifierNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ParkAsset" ADD COLUMN     "identifierNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sensor" ADD COLUMN     "identifierNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Hub_identifierNumber_key" ON "Hub"("identifierNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ParkAsset_identifierNumber_key" ON "ParkAsset"("identifierNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_identifierNumber_key" ON "Sensor"("identifierNumber");
