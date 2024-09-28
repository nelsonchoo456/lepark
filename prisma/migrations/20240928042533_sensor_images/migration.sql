/*
  Warnings:

  - You are about to drop the column `image` on the `Sensor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Sensor" DROP COLUMN "image",
ADD COLUMN     "images" TEXT[];
