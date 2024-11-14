/*
  Warnings:

  - The values [UNPAID_CLOSED,CONFIRMED_CLOSED] on the enum `BookingStatusEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatusEnum_new" AS ENUM ('PENDING', 'CANCELLED', 'REJECTED', 'APPROVED_PENDING_PAYMENT', 'CONFIRMED');
ALTER TABLE "Booking" ALTER COLUMN "bookingStatus" TYPE "BookingStatusEnum_new" USING ("bookingStatus"::text::"BookingStatusEnum_new");
ALTER TYPE "BookingStatusEnum" RENAME TO "BookingStatusEnum_old";
ALTER TYPE "BookingStatusEnum_new" RENAME TO "BookingStatusEnum";
DROP TYPE "BookingStatusEnum_old";
COMMIT;
