-- CreateEnum
CREATE TYPE "FeedbackCategoryEnum" AS ENUM ('FACILITY', 'PLANT', 'GENERAL');

-- CreateEnum
CREATE TYPE "FeedbackStatusEnum" AS ENUM ('PENDING', 'IN_PROGRESS', 'REJECTED', 'RESOLVED');

-- CreateTable
CREATE TABLE "Feedback" (
    "id" UUID NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateResolved" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "feedbackCategory" "FeedbackCategoryEnum" NOT NULL,
    "photos" TEXT[],
    "feedbackStatus" "FeedbackStatusEnum" NOT NULL,
    "remarks" TEXT NOT NULL,
    "staffId" UUID,
    "visitorId" UUID NOT NULL,
    "facilityId" UUID,
    "occurrenceId" UUID,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
