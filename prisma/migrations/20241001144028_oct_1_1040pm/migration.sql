/*
  Warnings:

  - The values [MAINTENANCE] on the enum `FacilityStatusEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FacilityStatusEnum_new" AS ENUM ('OPEN', 'CLOSED', 'UNDER_MAINTENANCE');
ALTER TABLE "Facility" ALTER COLUMN "facilityStatus" TYPE "FacilityStatusEnum_new" USING ("facilityStatus"::text::"FacilityStatusEnum_new");
ALTER TYPE "FacilityStatusEnum" RENAME TO "FacilityStatusEnum_old";
ALTER TYPE "FacilityStatusEnum_new" RENAME TO "FacilityStatusEnum";
DROP TYPE "FacilityStatusEnum_old";
COMMIT;
