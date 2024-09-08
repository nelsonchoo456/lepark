/*
  Warnings:

  - You are about to drop the column `occurenceId` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `occurenceId` on the `StatusLog` table. All the data in the column will be lost.
  - Added the required column `occurrenceId` to the `ActivityLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `occurrenceId` to the `StatusLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_occurenceId_fkey";

-- DropForeignKey
ALTER TABLE "StatusLog" DROP CONSTRAINT "StatusLog_occurenceId_fkey";

-- AlterTable
ALTER TABLE "ActivityLog" DROP COLUMN "occurenceId",
ADD COLUMN     "occurrenceId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "StatusLog" DROP COLUMN "occurenceId",
ADD COLUMN     "occurrenceId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusLog" ADD CONSTRAINT "StatusLog_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
