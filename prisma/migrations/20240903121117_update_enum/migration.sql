/*
  Warnings:

  - Changed the type of `conservationStatus` on the `Species` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `lightType` on the `Species` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `soilType` on the `Species` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ConservationStatusEnum" AS ENUM ('LEAST_CONCERN', 'NEAR_THREATENED', 'VULNERABLE', 'ENDANGERED', 'CRITICALLY_ENDANGERED', 'EXTINCT_IN__THE_WILD', 'EXTINCT');

-- CreateEnum
CREATE TYPE "LightTypeEnum" AS ENUM ('FULL_SUN', 'PARTIAL_SHADE', 'FULL_SHADE');

-- CreateEnum
CREATE TYPE "SoilTypeEnum" AS ENUM ('SANDY', 'CLAY', 'LOAM', 'PEATY', 'SILTY', 'CHALKY', 'SHALLOW');

-- AlterTable
ALTER TABLE "Species" DROP COLUMN "conservationStatus",
ADD COLUMN     "conservationStatus" "ConservationStatusEnum" NOT NULL,
DROP COLUMN "lightType",
ADD COLUMN     "lightType" "LightTypeEnum" NOT NULL,
DROP COLUMN "soilType",
ADD COLUMN     "soilType" "SoilTypeEnum" NOT NULL;

-- DropEnum
DROP TYPE "CONSERVATION_STATUS";

-- DropEnum
DROP TYPE "LIGHT_TYPE";

-- DropEnum
DROP TYPE "SOIL_TYPE";
