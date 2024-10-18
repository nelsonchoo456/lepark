-- CreateEnum
CREATE TYPE "EventTicketCategoryEnum" AS ENUM ('ADULT', 'CHILD', 'SENIOR', 'STUDENT');

-- CreateEnum
CREATE TYPE "EventTicketNationalityEnum" AS ENUM ('LOCAL', 'STANDARD');

-- CreateEnum
CREATE TYPE "EventTicketStatusEnum" AS ENUM ('VALID', 'INVALID', 'USED');

-- CreateTable
CREATE TABLE "EventTicketListing" (
    "id" UUID NOT NULL,
    "category" "EventTicketCategoryEnum" NOT NULL,
    "nationality" "EventTicketNationalityEnum" NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "eventId" UUID NOT NULL,

    CONSTRAINT "EventTicketListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTicket" (
    "id" UUID NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" "EventTicketStatusEnum" NOT NULL,
    "eventTicketListingId" UUID NOT NULL,
    "eventTicketTransactionId" UUID NOT NULL,

    CONSTRAINT "EventTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTicketTransaction" (
    "id" UUID NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "visitorId" UUID NOT NULL,
    "eventId" UUID NOT NULL,

    CONSTRAINT "EventTicketTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventTicketListing" ADD CONSTRAINT "EventTicketListing_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicket" ADD CONSTRAINT "EventTicket_eventTicketTransactionId_fkey" FOREIGN KEY ("eventTicketTransactionId") REFERENCES "EventTicketTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicketTransaction" ADD CONSTRAINT "EventTicketTransaction_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
