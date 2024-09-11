/*
  Warnings:

  - The values [GARDENER,MAINTENANCE_WORKER,CLEANER] on the enum `StaffRoleEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StaffRoleEnum_new" AS ENUM ('MANAGER', 'BOTANIST', 'ARBORIST', 'LANDSCAPE_ARCHITECT', 'PARK_RANGER', 'SUPERADMIN');
ALTER TABLE "Staff" ALTER COLUMN "role" TYPE "StaffRoleEnum_new" USING ("role"::text::"StaffRoleEnum_new");
ALTER TYPE "StaffRoleEnum" RENAME TO "StaffRoleEnum_old";
ALTER TYPE "StaffRoleEnum_new" RENAME TO "StaffRoleEnum";
DROP TYPE "StaffRoleEnum_old";
COMMIT;
