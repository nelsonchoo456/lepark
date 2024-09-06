/*
  Warnings:

  - The values [CLAY,LOAM,PEATY,SILTY,CHALKY,SHALLOW] on the enum `SoilTypeEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SoilTypeEnum_new" AS ENUM ('SANDY', 'CLAYEY', 'LOAMY');
ALTER TABLE "Species" ALTER COLUMN "soilType" TYPE "SoilTypeEnum_new" USING ("soilType"::text::"SoilTypeEnum_new");
ALTER TYPE "SoilTypeEnum" RENAME TO "SoilTypeEnum_old";
ALTER TYPE "SoilTypeEnum_new" RENAME TO "SoilTypeEnum";
DROP TYPE "SoilTypeEnum_old";
COMMIT;
