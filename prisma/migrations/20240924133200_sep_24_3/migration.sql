/*
  Warnings:

  - You are about to drop the column `staffId` on the `PlantTask` table. All the data in the column will be lost.
  - Added the required column `submittingStaffId` to the `PlantTask` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PlantTask" DROP CONSTRAINT "PlantTask_staffId_fkey";

-- AlterTable
ALTER TABLE "PlantTask" DROP COLUMN "staffId",
ADD COLUMN     "assignedStaffId" UUID,
ADD COLUMN     "submittingStaffId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "PlantTask" ADD CONSTRAINT "PlantTask_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantTask" ADD CONSTRAINT "PlantTask_submittingStaffId_fkey" FOREIGN KEY ("submittingStaffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
