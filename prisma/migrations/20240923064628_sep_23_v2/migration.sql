/*
  Warnings:

  - You are about to drop the column `dueDate` on the `PlantTask` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PlantTask" DROP COLUMN "dueDate",
ADD COLUMN     "completedDate" TIMESTAMP(3),
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "remarks" TEXT;
