/*
  Warnings:

  - You are about to drop the column `staffId` on the `Feedback` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_staffId_fkey";

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "staffId",
ADD COLUMN     "resolvedStaffId" UUID;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_resolvedStaffId_fkey" FOREIGN KEY ("resolvedStaffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
