/*
  Warnings:

  - You are about to drop the column `attractionDate` on the `AttractionTicket` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `AttractionTicket` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `AttractionTicketTransaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AttractionTicket" DROP COLUMN "attractionDate",
DROP COLUMN "price";

-- AlterTable
ALTER TABLE "AttractionTicketTransaction" DROP COLUMN "quantity";
