/*
  Warnings:

  - You are about to drop the `_VisitorFavoriteSpecies` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[speciesName]` on the table `Species` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_VisitorFavoriteSpecies" DROP CONSTRAINT "_VisitorFavoriteSpecies_A_fkey";

-- DropForeignKey
ALTER TABLE "_VisitorFavoriteSpecies" DROP CONSTRAINT "_VisitorFavoriteSpecies_B_fkey";

-- DropTable
DROP TABLE "_VisitorFavoriteSpecies";

-- CreateTable
CREATE TABLE "_VisitorFavouriteSpecies" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_VisitorFavouriteSpecies_AB_unique" ON "_VisitorFavouriteSpecies"("A", "B");

-- CreateIndex
CREATE INDEX "_VisitorFavouriteSpecies_B_index" ON "_VisitorFavouriteSpecies"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Species_speciesName_key" ON "Species"("speciesName");

-- AddForeignKey
ALTER TABLE "_VisitorFavouriteSpecies" ADD CONSTRAINT "_VisitorFavouriteSpecies_A_fkey" FOREIGN KEY ("A") REFERENCES "Species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VisitorFavouriteSpecies" ADD CONSTRAINT "_VisitorFavouriteSpecies_B_fkey" FOREIGN KEY ("B") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
