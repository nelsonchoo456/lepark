/*
  Warnings:

  - Added the required column `attractionPolicy` to the `Attraction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventPolicy` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attraction" ADD COLUMN     "attractionPolicy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "eventPolicy" TEXT NOT NULL;
