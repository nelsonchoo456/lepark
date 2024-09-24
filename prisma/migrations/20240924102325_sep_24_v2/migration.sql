/*
  Warnings:

  - The values [PENDING] on the enum `PlantTaskStatusEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PlantTaskStatusEnum_new" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE "PlantTask" ALTER COLUMN "taskStatus" TYPE "PlantTaskStatusEnum_new" USING ("taskStatus"::text::"PlantTaskStatusEnum_new");
ALTER TYPE "PlantTaskStatusEnum" RENAME TO "PlantTaskStatusEnum_old";
ALTER TYPE "PlantTaskStatusEnum_new" RENAME TO "PlantTaskStatusEnum";
DROP TYPE "PlantTaskStatusEnum_old";
COMMIT;
