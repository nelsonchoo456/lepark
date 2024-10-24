/*
  Warnings:

  - The values [IN_PROGRESS,RESOLVED] on the enum `FeedbackStatusEnum` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `needResponse` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FeedbackStatusEnum_new" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
ALTER TABLE "Feedback" ALTER COLUMN "feedbackStatus" TYPE "FeedbackStatusEnum_new" USING ("feedbackStatus"::text::"FeedbackStatusEnum_new");
ALTER TYPE "FeedbackStatusEnum" RENAME TO "FeedbackStatusEnum_old";
ALTER TYPE "FeedbackStatusEnum_new" RENAME TO "FeedbackStatusEnum";
DROP TYPE "FeedbackStatusEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "needResponse" BOOLEAN NOT NULL;
