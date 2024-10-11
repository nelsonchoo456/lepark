-- CreateEnum
CREATE TYPE "FAQStatusEnum" AS ENUM ('ACTIVE', 'INACTIVE', 'STAFF_ONLY');

-- CreateEnum
CREATE TYPE "FAQCategoryEnum" AS ENUM ('GENERAL', 'PARK_RULES', 'FACILITIES', 'EVENTS', 'OTHER');

-- CreateTable
CREATE TABLE "FAQ" (
    "id" UUID NOT NULL,
    "category" "FAQCategoryEnum" NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "status" "FAQStatusEnum" NOT NULL,
    "parkId" INTEGER,
    "priority" INTEGER,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FAQ_parkId_idx" ON "FAQ"("parkId");
