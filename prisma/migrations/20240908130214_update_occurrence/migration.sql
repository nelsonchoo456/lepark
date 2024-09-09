/*
  Warnings:

  - Changed the type of `activityLogType` on the `ActivityLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `occurrenceStatus` to the `Occurrence` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `decarbonizationType` on the `Occurrence` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `statusLogType` on the `StatusLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DecarbonizationTypeEnum" AS ENUM ('TREE_TROPICAL', 'TREE_MANGROVE', 'SHRUB');

-- CreateEnum
CREATE TYPE "OccurrenceStatusEnum" AS ENUM ('HEALTHY', 'MONITOR_AFTER_TREATMENT', 'NEEDS_ATTENTION', 'URGENT_ACTION_REQUIRED', 'REMOVED');

-- CreateEnum
CREATE TYPE "ActivityLogTypeEnum" AS ENUM ('WATERED', 'TRIMMED', 'FERTILIZED', 'PRUNED', 'REPLANTED', 'CHECKED_HEALTH', 'TREATED_PESTS', 'SOIL_REPLACED', 'HARVESTED', 'STAKED', 'MULCHED', 'MOVED', 'CHECKED', 'ADDED_COMPOST', 'OTHERS');

-- AlterTable
ALTER TABLE "ActivityLog" DROP COLUMN "activityLogType",
ADD COLUMN     "activityLogType" "ActivityLogTypeEnum" NOT NULL;

-- AlterTable
ALTER TABLE "Occurrence" ADD COLUMN     "occurrenceStatus" "OccurrenceStatusEnum" NOT NULL,
DROP COLUMN "decarbonizationType",
ADD COLUMN     "decarbonizationType" "DecarbonizationTypeEnum" NOT NULL;

-- AlterTable
ALTER TABLE "StatusLog" DROP COLUMN "statusLogType",
ADD COLUMN     "statusLogType" "OccurrenceStatusEnum" NOT NULL;

-- DropEnum
DROP TYPE "ACTIVITY_LOG_TYPE";

-- DropEnum
DROP TYPE "DECARBONIZATION_TYPE";

-- DropEnum
DROP TYPE "OCCURRENCE_STATUS_ENUM";
