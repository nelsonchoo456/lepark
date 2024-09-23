-- CreateEnum
CREATE TYPE "EventStatusEnum" AS ENUM ('ONGOING', 'UPCOMING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventTypeEnum" AS ENUM ('WORKSHOP', 'EXHIBITION', 'GUIDED_TOUR', 'PERFORMANCE', 'TALK', 'COMPETITION', 'FESTIVAL', 'CONFERENCE');

-- CreateEnum
CREATE TYPE "EventSuitabilityEnum" AS ENUM ('ANYONE', 'FAMILIES_AND_FRIENDS', 'CHILDREN', 'NATURE_ENTHUSIASTS', 'PETS', 'FITNESS_ENTHUSIASTS');

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "EventTypeEnum" NOT NULL,
    "suitability" "EventSuitabilityEnum" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "images" TEXT[],
    "status" "EventStatusEnum" NOT NULL,
    "facilityId" UUID NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_facilityId_idx" ON "Event"("facilityId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
