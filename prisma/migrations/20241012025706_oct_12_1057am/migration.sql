/*
  Warnings:

  - You are about to alter the column `dataTransmissionInterval` on the `Hub` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Hub" ALTER COLUMN "dataTransmissionInterval" SET DATA TYPE INTEGER;
