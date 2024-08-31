-- CreateEnum
CREATE TYPE "CONSERVATION_STATUS" AS ENUM ('LEAST_CONCERN', 'NEAR_THREATENED', 'VULNERABLE', 'ENDANGERED', 'CRITICALLY_ENDANGERED', 'EXTINCT_IN__THE_WILD', 'EXTINCT');

-- CreateEnum
CREATE TYPE "LIGHT_TYPE" AS ENUM ('FULL_SUN', 'PARTIAL_SHADE', 'FULL_SHADE');

-- CreateEnum
CREATE TYPE "SOIL_TYPE" AS ENUM ('SANDY', 'CLAY', 'LOAM', 'PEATY', 'SILTY', 'CHALKY', 'SHALLOW');

-- CreateTable
CREATE TABLE "Species" (
    "speciesId" UUID NOT NULL,
    "phylum" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "order" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "genus" TEXT NOT NULL,
    "speciesName" TEXT NOT NULL,
    "commonName" TEXT NOT NULL,
    "speciesDescription" TEXT NOT NULL,
    "conservationStatus" "CONSERVATION_STATUS" NOT NULL,
    "originCountry" TEXT NOT NULL,
    "lightType" "LIGHT_TYPE" NOT NULL,
    "soilType" "SOIL_TYPE" NOT NULL,
    "fertiliserType" TEXT NOT NULL,
    "waterRequirement" INTEGER NOT NULL,
    "fertiliserRequirement" INTEGER NOT NULL,
    "idealHumidity" DOUBLE PRECISION NOT NULL,
    "minTemp" DOUBLE PRECISION NOT NULL,
    "maxTemp" DOUBLE PRECISION NOT NULL,
    "idealTemp" DOUBLE PRECISION NOT NULL,
    "isDroughtTolerant" BOOLEAN NOT NULL,
    "isFastGrowing" BOOLEAN NOT NULL,
    "isSlowGrowing" BOOLEAN NOT NULL,
    "isEdible" BOOLEAN NOT NULL,
    "isDeciduous" BOOLEAN NOT NULL,
    "isEvergreen" BOOLEAN NOT NULL,
    "isToxic" BOOLEAN NOT NULL,
    "isFragrant" BOOLEAN NOT NULL,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("speciesId")
);
