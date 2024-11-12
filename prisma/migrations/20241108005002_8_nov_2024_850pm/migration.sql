-- AlterTable
ALTER TABLE "Attraction" ADD COLUMN     "cameraSensorId" UUID;

-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "cameraSensorId" UUID;

-- AddForeignKey
ALTER TABLE "Attraction" ADD CONSTRAINT "Attraction_cameraSensorId_fkey" FOREIGN KEY ("cameraSensorId") REFERENCES "Sensor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_cameraSensorId_fkey" FOREIGN KEY ("cameraSensorId") REFERENCES "Sensor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
