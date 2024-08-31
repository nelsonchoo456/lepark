/*
  Warnings:

  - The primary key for the `Species` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `speciesId` on the `Species` table. All the data in the column will be lost.
  - The required column `id` was added to the `Species` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Species" DROP CONSTRAINT "Species_pkey",
DROP COLUMN "speciesId",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Species_pkey" PRIMARY KEY ("id");
