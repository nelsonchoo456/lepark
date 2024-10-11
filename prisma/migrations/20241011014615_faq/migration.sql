-- CreateEnum
CREATE TYPE "FAQStatusEnum" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FAQCategoryEnum" AS ENUM ('GENERAL', 'PARK_RULES', 'FACILITIES', 'EVENTS', 'SAFETY', 'ACCESSIBILITY', 'SERVICES', 'TICKETING', 'PARK_HISTORY', 'OTHER');

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
