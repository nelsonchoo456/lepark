/*
  Warnings:

  - Added the required column `status` to the `Announcement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "status" "AnnouncementStatusEnum" NOT NULL;
