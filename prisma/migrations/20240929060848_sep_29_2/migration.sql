/*
  Warnings:

  - Made the column `facilityId` on table `Hub` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Hub" ALTER COLUMN "facilityId" SET NOT NULL;
