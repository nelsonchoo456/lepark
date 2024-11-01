import {
  Prisma,
  EventTicketTransaction,
  EventTicket,
  EventTicketStatusEnum,
  PrismaClient,
  Visitor,
  Event,
  EventTicketListing,
} from '@prisma/client';
import { z } from 'zod';
import {
  EventTicketSchema,
  EventTicketSchemaType,
  EventTicketTransactionSchema,
  EventTicketTransactionSchemaType,
} from '../schemas/eventTicketSchema';
import EventTicketDao from '../dao/EventTicketDao';
import EventDao from '../dao/EventDao';
import VisitorDao from '../dao/VisitorDao';
import { fromZodError } from 'zod-validation-error';
import { EventResponse, VisitorResponse } from '@lepark/data-access';
import EmailUtil from '../utils/EmailUtil';
import dayjs from 'dayjs';

const prisma = new PrismaClient();
interface TicketInput {
  listingId: string;
  quantity: number;
}

class EventTicketService {
  public async createEventTicketTransaction(data: EventTicketTransactionSchemaType): Promise<EventTicketTransaction> {
    try {
      // Check if the event exists
      const event = await EventDao.getEventById(data.eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // Check if the visitor exists
      const visitor = await VisitorDao.getVisitorById(data.visitorId);
      if (!visitor) {
        throw new Error('Visitor not found');
      }

      const formattedData = dateFormatter(data);
      const { tickets, ...transactionData } = formattedData;

      // Create the transaction with tickets
      const result = await EventTicketDao.createEventTicketTransaction(transactionData, tickets);

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getAllEventTicketTransactions(): Promise<EventTicketTransaction[]> {
    return EventTicketDao.getAllEventTicketTransactions();
  }

  public async getEventTicketTransactionById(id: string): Promise<EventTicketTransaction & { visitor: Visitor; event: Event }> {
    const transaction = await EventTicketDao.getEventTicketTransactionById(id);
    if (!transaction) {
      throw new Error('Event ticket transaction not found');
    }

    const visitor = await VisitorDao.getVisitorById(transaction.visitorId);
    if (!visitor) return null;

    const event = await EventDao.getEventById(transaction.eventId);
    if (!event) return null;

    return { ...transaction, visitor, event };
  }

  public async getEventTicketTransactionsByVisitorId(
    visitorId: string,
  ): Promise<(EventTicketTransaction & { visitor: Visitor; event: Event })[]> {
    const visitor = await VisitorDao.getVisitorById(visitorId);
    if (!visitor) {
      throw new Error('Visitor not found');
    }

    const transactions = await EventTicketDao.getEventTicketTransactionsByVisitorId(visitorId);

    // Fetch event details for each transaction
    const transactionsWithDetails = await Promise.all(
      transactions.map(async (transaction) => {
        const event = await EventDao.getEventById(transaction.eventId);
        return {
          ...transaction,
          visitor,
          event,
        };
      }),
    );

    return transactionsWithDetails;
  }

  public async getEventTicketTransactionsByEventId(eventId: string): Promise<EventTicketTransaction[]> {
    const event = await EventDao.getEventById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    return EventTicketDao.getEventTicketTransactionsByEventId(eventId);
  }

  public async deleteEventTicketTransaction(id: string): Promise<void> {
    const existingTransaction = await EventTicketDao.getEventTicketTransactionById(id);
    if (!existingTransaction) {
      throw new Error('Event ticket transaction not found');
    }

    await EventTicketDao.deleteEventTicketTransaction(id);
  }

  public async createEventTicket(data: EventTicketSchemaType): Promise<EventTicket> {
    try {
      const listing = await EventDao.getEventTicketListingById(data.eventTicketListingId);
      if (!listing) {
        throw new Error('Listing not found');
      }

      // Check if the transaction exists
      const transaction = await EventTicketDao.getEventTicketTransactionById(data.eventTicketTransactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const formattedData = dateFormatter(data);
      EventTicketSchema.parse(formattedData);

      const ticketData = ensureAllTicketFieldsPresent(formattedData);

      return EventTicketDao.createEventTicket(ticketData);
    } catch (error) {
      throw new Error(`Failed to create event ticket: ${error.message}`);
    }
  }

  public async getEventTicketById(
    id: string,
  ): Promise<EventTicket & { eventTicketListing: EventTicketListing; eventTicketTransaction: EventTicketTransaction }> {
    const ticket = await EventTicketDao.getEventTicketById(id);
    if (!ticket) {
      throw new Error('Event ticket not found');
    }

    const updatedTicket = await this.updateTicketStatusIfExpired(ticket);

    const eventTicketListing = await EventDao.getEventTicketListingById(updatedTicket.eventTicketListingId);
    if (!eventTicketListing) return null;

    const eventTicketTransaction = await EventTicketDao.getEventTicketTransactionById(updatedTicket.eventTicketTransactionId);
    if (!eventTicketTransaction) return null;

    return { ...updatedTicket, eventTicketListing, eventTicketTransaction };
  }

  public async getAllEventTickets(): Promise<EventTicket[]> {
    const tickets = await EventTicketDao.getAllEventTickets();
    return Promise.all(tickets.map((ticket) => this.updateTicketStatusIfExpired(ticket)));
  }

  public async deleteEventTicket(id: string): Promise<void> {
    const existingTicket = await EventTicketDao.getEventTicketById(id);
    if (!existingTicket) {
      throw new Error('Event ticket not found');
    }
    await EventTicketDao.deleteEventTicket(id);
  }

  public async getEventTicketsByTransactionId(transactionId: string): Promise<EventTicket[]> {
    const tickets = await EventTicketDao.getEventTicketsByTransactionId(transactionId);

    const updatedTickets = await Promise.all(tickets.map((ticket) => this.updateTicketStatusIfExpired(ticket)));

    // Fetch the associated ticket listings
    const ticketsWithListings = await Promise.all(
      updatedTickets.map(async (ticket) => {
        const listing = await EventDao.getEventTicketListingById(ticket.eventTicketListingId);
        return {
          ...ticket,
          eventTicketListing: listing,
        };
      }),
    );

    return ticketsWithListings;
  }

  public async getEventTicketsByListingId(listingId: string): Promise<EventTicket[]> {
    const listing = await EventDao.getEventTicketListingById(listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    const tickets = await EventTicketDao.getEventTicketsByListingId(listingId);

    const updatedTickets = await Promise.all(tickets.map((ticket) => this.updateTicketStatusIfExpired(ticket)));

    // Fetch the associated ticket transactions
    const ticketsWithTransactions = await Promise.all(
      updatedTickets.map(async (ticket) => {
        const transaction = await EventTicketDao.getEventTicketTransactionById(ticket.eventTicketTransactionId);
        return {
          ...ticket,
          eventTicketTransaction: transaction,
        };
      }),
    );

    return ticketsWithTransactions;
  }

  public async updateEventTicketStatus(id: string, status: EventTicketStatusEnum): Promise<EventTicket> {
    const existingTicket = await EventTicketDao.getEventTicketById(id);
    if (!existingTicket) {
      throw new Error('Event ticket not found');
    }
    return EventTicketDao.updateEventTicketStatus(id, status);
  }

  public async getEventTicketsByEventId(eventId: string): Promise<(EventTicket & { eventTicketListing: EventTicketListing })[]> {
    const event = await EventDao.getEventById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const tickets = await EventTicketDao.getEventTicketsByEventId(eventId);

    const updatedTickets = await Promise.all(tickets.map((ticket) => this.updateTicketStatusIfExpired(ticket)));

    // Fetch the associated ticket listings
    const ticketsWithListings = await Promise.all(
      updatedTickets.map(async (ticket) => {
        const listing = await EventDao.getEventTicketListingById(ticket.eventTicketListingId);
        return {
          ...ticket,
          eventTicketListing: listing,
        };
      }),
    );

    return ticketsWithListings;
  }

  public async sendEventTicketEmail(transactionId: string, recipientEmail: string): Promise<void> {
    try {
      const transaction = await EventTicketDao.getEventTicketTransactionById(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      await EmailUtil.sendEventTicketEmail(recipientEmail, transaction);
    } catch (error) {
      throw new Error(`Failed to send event ticket email: ${error.message}`);
    }
  }

  public async sendRequestedEventTicketEmail(transactionId: string, recipientEmail: string): Promise<void> {
    try {
      const transaction = await EventTicketDao.getEventTicketTransactionById(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      await EmailUtil.sendRequestedEventTicketEmail(recipientEmail, transaction);
    } catch (error) {
      throw new Error(`Failed to send requested attraction ticket email: ${error.message}`);
    }
  }

  private async updateTicketStatusIfExpired(
    ticket: EventTicket & { eventTicketTransaction?: EventTicketTransaction },
  ): Promise<EventTicket> {
    if (!ticket.eventTicketTransaction) {
      ticket.eventTicketTransaction = await EventTicketDao.getEventTicketTransactionById(ticket.eventTicketTransactionId);
    }

    const event = await EventDao.getEventById(ticket.eventTicketTransaction.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const eventEndDate = new Date(event.endDate);
    const now = new Date();

    if (ticket.status === EventTicketStatusEnum.VALID && eventEndDate < now) {
      return this.updateEventTicketStatus(ticket.id, EventTicketStatusEnum.INVALID);
    }

    return ticket;
  }

  public async verifyEventTicket(ticketId: string): Promise<boolean> {
    const ticket = await EventTicketDao.getEventTicketById(ticketId);
    const updatedTicket = await this.updateTicketStatusIfExpired(ticket);
    if (!updatedTicket) {
      throw new Error('Ticket not found');
    }

    const transaction = await EventTicketDao.getEventTicketTransactionById(updatedTicket.eventTicketTransactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const event = await EventDao.getEventById(transaction.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (updatedTicket.status === EventTicketStatusEnum.INVALID) {
      throw new Error('Ticket has expired and is no longer valid.');
    } else if (updatedTicket.status === EventTicketStatusEnum.USED) {
      throw new Error('Ticket has already been used and is no longer valid.');
    } else if (event.startDate > new Date()) {
      throw new Error(`Ticket is not yet valid, it is only valid from ${dayjs(event.startDate).format('DD MMMM YYYY HH:mm')}.`);
    } else if (updatedTicket.status === EventTicketStatusEnum.VALID) {
      await EventTicketDao.updateEventTicketStatus(updatedTicket.id, EventTicketStatusEnum.USED);
      return true;
    } else {
      throw new Error('Ticket is not valid');
    }
  }
}

function ensureAllTicketFieldsPresent(data: EventTicketSchemaType): Prisma.EventTicketCreateInput {
  if (!data.status || !data.eventTicketListingId || !data.eventTicketTransactionId) {
    throw new Error('Missing required fields for event ticket creation');
  }

  return data as Prisma.EventTicketCreateInput;
}

const dateFormatter = (data: any) => {
  const { eventDate, purchaseDate, ...rest } = data;
  const formattedData = { ...rest };

  const eventDateFormat = eventDate ? new Date(eventDate) : undefined;
  const purchaseDateFormat = purchaseDate ? new Date(purchaseDate) : undefined;
  if (eventDate) {
    formattedData.eventDate = eventDateFormat;
  }
  if (purchaseDate) {
    formattedData.purchaseDate = purchaseDateFormat;
  }
  return formattedData;
};

export default new EventTicketService();
