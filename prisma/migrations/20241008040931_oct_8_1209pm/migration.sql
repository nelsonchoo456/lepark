-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "PromotionStatus" AS ENUM ('ENABLED', 'DISABLED');

-- DropForeignKey
ALTER TABLE "PlantTask" DROP CONSTRAINT "PlantTask_submittingStaffId_fkey";

-- CreateTable
CREATE TABLE "Promotion" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "DiscountType" NOT NULL,
    "promoCode" TEXT,
    "isNParksWide" BOOLEAN NOT NULL,
    "parkId" INTEGER,
    "images" TEXT[],
    "discountValue" DOUBLE PRECISION NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "status" "PromotionStatus" NOT NULL,
    "terms" TEXT[],
    "maximumUsage" INTEGER,
    "minimumAmount" DOUBLE PRECISION,
    "isOneTime" BOOLEAN NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_VisitorPromotionsRedeemed" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_VisitorPromotionsRedeemed_AB_unique" ON "_VisitorPromotionsRedeemed"("A", "B");

-- CreateIndex
CREATE INDEX "_VisitorPromotionsRedeemed_B_index" ON "_VisitorPromotionsRedeemed"("B");

-- AddForeignKey
ALTER TABLE "PlantTask" ADD CONSTRAINT "PlantTask_submittingStaffId_fkey" FOREIGN KEY ("submittingStaffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VisitorPromotionsRedeemed" ADD CONSTRAINT "_VisitorPromotionsRedeemed_A_fkey" FOREIGN KEY ("A") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VisitorPromotionsRedeemed" ADD CONSTRAINT "_VisitorPromotionsRedeemed_B_fkey" FOREIGN KEY ("B") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
