/*
  Warnings:

  - The values [EXTINCT_IN__THE_WILD] on the enum `ConservationStatusEnum` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `favoriteSpeciesIds` on the `Visitor` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ConservationStatusEnum_new" AS ENUM ('LEAST_CONCERN', 'NEAR_THREATENED', 'VULNERABLE', 'ENDANGERED', 'CRITICALLY_ENDANGERED', 'EXTINCT_IN_THE_WILD', 'EXTINCT');
ALTER TABLE "Species" ALTER COLUMN "conservationStatus" TYPE "ConservationStatusEnum_new" USING ("conservationStatus"::text::"ConservationStatusEnum_new");
ALTER TYPE "ConservationStatusEnum" RENAME TO "ConservationStatusEnum_old";
ALTER TYPE "ConservationStatusEnum_new" RENAME TO "ConservationStatusEnum";
DROP TYPE "ConservationStatusEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "Visitor" DROP COLUMN "favoriteSpeciesIds";

-- CreateTable
CREATE TABLE "_VisitorFavoriteSpecies" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_VisitorFavoriteSpecies_AB_unique" ON "_VisitorFavoriteSpecies"("A", "B");

-- CreateIndex
CREATE INDEX "_VisitorFavoriteSpecies_B_index" ON "_VisitorFavoriteSpecies"("B");

-- AddForeignKey
ALTER TABLE "_VisitorFavoriteSpecies" ADD CONSTRAINT "_VisitorFavoriteSpecies_A_fkey" FOREIGN KEY ("A") REFERENCES "Species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VisitorFavoriteSpecies" ADD CONSTRAINT "_VisitorFavoriteSpecies_B_fkey" FOREIGN KEY ("B") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
