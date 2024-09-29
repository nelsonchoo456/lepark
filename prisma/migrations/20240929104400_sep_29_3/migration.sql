/*
  Warnings:

  - A unique constraint covering the columns `[serialNumber]` on the table `ParkAsset` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serialNumber` to the `ParkAsset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ParkAsset" ADD COLUMN     "serialNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ParkAsset_serialNumber_key" ON "ParkAsset"("serialNumber");
