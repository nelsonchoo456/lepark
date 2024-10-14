/*
  Warnings:

  - You are about to drop the column `attractionPolicy` on the `Attraction` table. All the data in the column will be lost.
  - You are about to drop the column `eventPolicy` on the `Event` table. All the data in the column will be lost.
  - Added the required column `ticketingPolicy` to the `Attraction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketingPolicy` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attraction" DROP COLUMN "attractionPolicy",
ADD COLUMN     "ticketingPolicy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "eventPolicy",
ADD COLUMN     "ticketingPolicy" TEXT NOT NULL;
