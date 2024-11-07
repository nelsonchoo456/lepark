/*
  Warnings:

  - Added the required column `maxCapacity` to the `Attraction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attraction" ADD COLUMN     "maxCapacity" INTEGER NOT NULL;
