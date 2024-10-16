/*
  Warnings:

  - The values [FACILITY,PLANT,GENERAL] on the enum `FeedbackCategoryEnum` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `facilityId` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `occurrenceId` on the `Feedback` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FeedbackCategoryEnum_new" AS ENUM ('FACILITIES', 'SERVICES', 'STAFF', 'SAFETY', 'CLEANLINESS', 'ACCESSIBILITY', 'EVENTS', 'WILDLIFE', 'OTHER');
ALTER TABLE "Feedback" ALTER COLUMN "feedbackCategory" TYPE "FeedbackCategoryEnum_new" USING ("feedbackCategory"::text::"FeedbackCategoryEnum_new");
ALTER TYPE "FeedbackCategoryEnum" RENAME TO "FeedbackCategoryEnum_old";
ALTER TYPE "FeedbackCategoryEnum_new" RENAME TO "FeedbackCategoryEnum";
DROP TYPE "FeedbackCategoryEnum_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_facilityId_fkey";

-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_occurrenceId_fkey";

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "facilityId",
DROP COLUMN "occurrenceId";
