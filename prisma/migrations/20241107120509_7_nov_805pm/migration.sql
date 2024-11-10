-- AddForeignKey
ALTER TABLE "AttractionTicket" ADD CONSTRAINT "AttractionTicket_attractionTicketListingId_fkey" FOREIGN KEY ("attractionTicketListingId") REFERENCES "AttractionTicketListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttractionTicketTransaction" ADD CONSTRAINT "AttractionTicketTransaction_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "Attraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicket" ADD CONSTRAINT "EventTicket_eventTicketListingId_fkey" FOREIGN KEY ("eventTicketListingId") REFERENCES "EventTicketListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicketTransaction" ADD CONSTRAINT "EventTicketTransaction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
