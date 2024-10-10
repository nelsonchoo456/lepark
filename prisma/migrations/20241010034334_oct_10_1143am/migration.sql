/*
  Warnings:

  - Made the column `position` on table `PlantTask` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PlantTask" ALTER COLUMN "position" SET NOT NULL;
