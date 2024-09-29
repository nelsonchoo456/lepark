/*
  Warnings:

  - You are about to drop the column `latitude` on the `Sensor` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Sensor` table. All the data in the column will be lost.
  - Made the column `sensorUnit` on table `Sensor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Sensor" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "long" DOUBLE PRECISION,
ALTER COLUMN "sensorUnit" SET NOT NULL;
