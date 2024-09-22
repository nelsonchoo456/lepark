-- AlterTable
ALTER TABLE "Sensor" ADD COLUMN     "facilityId" UUID;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
