/*
  Warnings:

  - The `nextMaintenanceDate` column on the `Hub` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Hub" ADD COLUMN     "lastMaintenanceDate" TIMESTAMP(3),
DROP COLUMN "nextMaintenanceDate",
ADD COLUMN     "nextMaintenanceDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ParkAsset" ADD COLUMN     "lastMaintenanceDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Sensor" ADD COLUMN     "lastMaintenanceDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "MaintenanceHistory" (
    "id" UUID NOT NULL,
    "hubId" UUID,
    "sensorId" UUID,
    "assetId" UUID,
    "maintenanceDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "MaintenanceHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MaintenanceHistory" ADD CONSTRAINT "MaintenanceHistory_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "Hub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceHistory" ADD CONSTRAINT "MaintenanceHistory_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceHistory" ADD CONSTRAINT "MaintenanceHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "ParkAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
