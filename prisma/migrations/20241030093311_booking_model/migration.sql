-- CreateEnum
CREATE TYPE "BookingStatusEnum" AS ENUM ('PENDING', 'CANCELLED', 'REJECTED', 'APPROVED_PENDING_PAYMENT', 'UNPAID_CLOSED', 'CONFIRMED', 'CONFIRMED_CLOSED');

-- CreateTable
CREATE TABLE "Booking" (
    "id" UUID NOT NULL,
    "bookingPurpose" TEXT NOT NULL,
    "pax" INTEGER NOT NULL,
    "bookingStatus" "BookingStatusEnum" NOT NULL,
    "dateStart" TIMESTAMP(3) NOT NULL,
    "dateEnd" TIMESTAMP(3) NOT NULL,
    "dateBooked" TIMESTAMP(3) NOT NULL,
    "paymentDeadline" TIMESTAMP(3),
    "visitorRemarks" TEXT NOT NULL,
    "facilityId" UUID NOT NULL,
    "visitorId" UUID NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
