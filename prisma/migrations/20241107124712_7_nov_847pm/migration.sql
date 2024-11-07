/*
  Warnings:

  - You are about to drop the `_visitorFavoriteSpecies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_visitorPromotionsRedeemed` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_visitorFavoriteSpecies" DROP CONSTRAINT "_visitorFavoriteSpecies_A_fkey";

-- DropForeignKey
ALTER TABLE "_visitorFavoriteSpecies" DROP CONSTRAINT "_visitorFavoriteSpecies_B_fkey";

-- DropForeignKey
ALTER TABLE "_visitorPromotionsRedeemed" DROP CONSTRAINT "_visitorPromotionsRedeemed_A_fkey";

-- DropForeignKey
ALTER TABLE "_visitorPromotionsRedeemed" DROP CONSTRAINT "_visitorPromotionsRedeemed_B_fkey";

-- DropTable
DROP TABLE "_visitorFavoriteSpecies";

-- DropTable
DROP TABLE "_visitorPromotionsRedeemed";

-- CreateTable
CREATE TABLE "_SpeciesToVisitor" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_PromotionToVisitor" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SpeciesToVisitor_AB_unique" ON "_SpeciesToVisitor"("A", "B");

-- CreateIndex
CREATE INDEX "_SpeciesToVisitor_B_index" ON "_SpeciesToVisitor"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PromotionToVisitor_AB_unique" ON "_PromotionToVisitor"("A", "B");

-- CreateIndex
CREATE INDEX "_PromotionToVisitor_B_index" ON "_PromotionToVisitor"("B");

-- AddForeignKey
ALTER TABLE "_SpeciesToVisitor" ADD CONSTRAINT "_SpeciesToVisitor_A_fkey" FOREIGN KEY ("A") REFERENCES "Species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpeciesToVisitor" ADD CONSTRAINT "_SpeciesToVisitor_B_fkey" FOREIGN KEY ("B") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromotionToVisitor" ADD CONSTRAINT "_PromotionToVisitor_A_fkey" FOREIGN KEY ("A") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromotionToVisitor" ADD CONSTRAINT "_PromotionToVisitor_B_fkey" FOREIGN KEY ("B") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
