-- CreateEnum
CREATE TYPE "PARK_STATUS_ENUM" AS ENUM ('OPEN', 'UNDER_CONSTRUCTION', 'LIMITED_ACCESS');

-- CreateTable
CREATE TABLE "Park" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "parkStatus" TEXT NOT NULL,
    "openingHours" TIMESTAMP(3)[],
    "closingHours" TIMESTAMP(3)[],
    "geom" TEXT NOT NULL,
    "paths" TEXT NOT NULL,

    CONSTRAINT "Park_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Park_parkStatus_key" ON "Park"("parkStatus");
