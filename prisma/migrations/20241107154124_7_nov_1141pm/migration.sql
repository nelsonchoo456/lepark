/*
  Warnings:

  - Changed the type of `discountType` on the `Promotion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Promotion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DiscountTypeEnum" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "PromotionStatusEnum" AS ENUM ('ENABLED', 'DISABLED');

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "discountType",
ADD COLUMN     "discountType" "DiscountTypeEnum" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "PromotionStatusEnum" NOT NULL;

-- DropEnum
DROP TYPE "DiscountType";

-- DropEnum
DROP TYPE "PromotionStatus";
