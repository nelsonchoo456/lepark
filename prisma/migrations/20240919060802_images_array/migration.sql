/*
  Warnings:

  - You are about to drop the column `image` on the `Hub` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hub" DROP COLUMN "image",
ADD COLUMN     "images" TEXT[];
