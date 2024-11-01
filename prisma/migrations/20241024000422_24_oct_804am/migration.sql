-- CreateTable
CREATE TABLE "PredictedWaterSchedule" (
    "id" UUID NOT NULL,
    "hubId" UUID NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "waterAmount" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PredictedWaterSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PredictedWaterSchedule_hubId_scheduledDate_idx" ON "PredictedWaterSchedule"("hubId", "scheduledDate");

-- AddForeignKey
ALTER TABLE "PredictedWaterSchedule" ADD CONSTRAINT "PredictedWaterSchedule_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE CASCADE ON UPDATE CASCADE;
