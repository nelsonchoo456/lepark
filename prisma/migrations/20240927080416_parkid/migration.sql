/*
  Warnings:

  - Added the required column `parkId` to the `DecarbonizationArea` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DecarbonizationArea" ADD COLUMN     "parkId" INTEGER NOT NULL;
