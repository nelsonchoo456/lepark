-- CreateEnum
CREATE TYPE "AttractionStatusEnum" AS ENUM ('OPEN', 'CLOSED', 'UNDER_MAINTENANCE');

-- CreateTable
CREATE TABLE "Attraction" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "openingHours" TIMESTAMP(3)[],
    "closingHours" TIMESTAMP(3)[],
    "images" TEXT[],
    "status" "AttractionStatusEnum" NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "parkId" INTEGER NOT NULL,

    CONSTRAINT "Attraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Attraction_parkId_idx" ON "Attraction"("parkId");
