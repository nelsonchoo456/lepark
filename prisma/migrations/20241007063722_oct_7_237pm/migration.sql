/*
  Warnings:

  - You are about to drop the column `calibrationFrequencyDays` on the `Sensor` table. All the data in the column will be lost.
  - You are about to drop the column `dataFrequencyMinutes` on the `Sensor` table. All the data in the column will be lost.
  - You are about to drop the column `lastCalibratedDate` on the `Sensor` table. All the data in the column will be lost.
  - You are about to drop the `CalibrationHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CalibrationHistory" DROP CONSTRAINT "CalibrationHistory_sensorId_fkey";

-- AlterTable
ALTER TABLE "Sensor" DROP COLUMN "calibrationFrequencyDays",
DROP COLUMN "dataFrequencyMinutes",
DROP COLUMN "lastCalibratedDate";

-- DropTable
DROP TABLE "CalibrationHistory";
