import {
  Prisma,
  AttractionTicketTransaction,
  AttractionTicket,
  AttractionTicketStatusEnum,
  PrismaClient,
  Visitor,
  Attraction,
  AttractionTicketListing,
} from '@prisma/client';
import { z } from 'zod';
import {
  AttractionTicketSchema,
  AttractionTicketSchemaType,
  AttractionTicketTransactionSchema,
  AttractionTicketTransactionSchemaType,
} from '../schemas/attractionTicketSchema';
import AttractionTicketDao from '../dao/AttractionTicketDao';
import AttractionDao from '../dao/AttractionDao';
import VisitorDao from '../dao/VisitorDao';
import { fromZodError } from 'zod-validation-error';
import { AttractionResponse, VisitorResponse } from '@lepark/data-access';
import EmailUtil from '../utils/EmailUtil';
import dayjs from 'dayjs';

const prisma = new PrismaClient();
interface TicketInput {
  listingId: string;
  quantity: number;
}

class AttractionTicketService {
  public async createAttractionTicketTransaction(data: AttractionTicketTransactionSchemaType): Promise<AttractionTicketTransaction> {
    try {
      // Check if the attraction exists
      const attraction = await AttractionDao.getAttractionById(data.attractionId);
      if (!attraction) {
        throw new Error('Attraction not found');
      }

      // Check if the visitor exists
      const visitor = await VisitorDao.getVisitorById(data.visitorId);
      if (!visitor) {
        throw new Error('Visitor not found');
      }

      const formattedData = dateFormatter(data);
      const { tickets, ...transactionData } = formattedData;

      // Create the transaction with tickets
      const result = await AttractionTicketDao.createAttractionTicketTransaction(transactionData, tickets);

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        throw new Error(`${validationError.message}`);
      }
      throw error;
    }
  }

  public async getAllAttractionTicketTransactions(): Promise<AttractionTicketTransaction[]> {
    return AttractionTicketDao.getAllAttractionTicketTransactions();
  }

  public async getAttractionTicketTransactionById(
    id: string,
  ): Promise<AttractionTicketTransaction & { visitor: Visitor; attraction: Attraction }> {
    const transaction = await AttractionTicketDao.getAttractionTicketTransactionById(id);
    if (!transaction) {
      throw new Error('Attraction ticket transaction not found');
    }

    const visitor = await VisitorDao.getVisitorById(transaction.visitorId);
    if (!visitor) return null;

    const attraction = await AttractionDao.getAttractionById(transaction.attractionId);
    if (!attraction) return null;

    return { ...transaction, visitor, attraction };
  }

  public async getAttractionTicketTransactionsByVisitorId(
    visitorId: string,
  ): Promise<(AttractionTicketTransaction & { visitor: Visitor; attraction: Attraction })[]> {
    const visitor = await VisitorDao.getVisitorById(visitorId);
    if (!visitor) {
      throw new Error('Visitor not found');
    }

    const transactions = await AttractionTicketDao.getAttractionTicketTransactionsByVisitorId(visitorId);

    // Fetch attraction details for each transaction
    const transactionsWithDetails = await Promise.all(
      transactions.map(async (transaction) => {
        const attraction = await AttractionDao.getAttractionById(transaction.attractionId);
        return {
          ...transaction,
          visitor,
          attraction,
        };
      }),
    );

    return transactionsWithDetails;
  }

  public async getAttractionTicketTransactionsByAttractionId(attractionId: string): Promise<AttractionTicketTransaction[]> {
    const attraction = await AttractionDao.getAttractionById(attractionId);
    if (!attraction) {
      throw new Error('Attraction not found');
    }

    return AttractionTicketDao.getAttractionTicketTransactionsByAttractionId(attractionId);
  }

  public async deleteAttractionTicketTransaction(id: string): Promise<void> {
    const existingTransaction = await AttractionTicketDao.getAttractionTicketTransactionById(id);
    if (!existingTransaction) {
      throw new Error('Attraction ticket transaction not found');
    }

    // Additional checks can be added here
    // For example, ensuring that only transactions with certain statuses can be deleted

    await AttractionTicketDao.deleteAttractionTicketTransaction(id);
  }

  public async createAttractionTicket(data: AttractionTicketSchemaType): Promise<AttractionTicket> {
    try {
      const listing = await AttractionDao.getAttractionTicketListingById(data.attractionTicketListingId);
      if (!listing) {
        throw new Error('Listiing not found');
      }

      // Check if the transaction exists
      const transaction = await AttractionTicketDao.getAttractionTicketTransactionById(data.attractionTicketTransactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const formattedData = dateFormatter(data);
      AttractionTicketSchema.parse(formattedData);

      const ticketData = ensureAllTicketFieldsPresent(formattedData);

      return AttractionTicketDao.createAttractionTicket(ticketData);
    } catch (error) {
      throw new Error(`Failed to create attraction ticket: ${error.message}`);
    }
  }

  public async getAttractionTicketById(
    id: string,
  ): Promise<
    AttractionTicket & { attractionTicketListing: AttractionTicketListing; attractionTicketTransaction: AttractionTicketTransaction }
  > {
    const ticket = await AttractionTicketDao.getAttractionTicketById(id);
    if (!ticket) {
      throw new Error('Attraction ticket not found');
    }

    const updatedTicket = await this.updateTicketStatusIfExpired(ticket);

    const attractionTicketListing = await AttractionDao.getAttractionTicketListingById(updatedTicket.attractionTicketListingId);
    if (!attractionTicketListing) return null;

    const attractionTicketTransaction = await AttractionTicketDao.getAttractionTicketTransactionById(
      updatedTicket.attractionTicketTransactionId,
    );
    if (!attractionTicketTransaction) return null;

    return { ...updatedTicket, attractionTicketListing, attractionTicketTransaction };
  }

  public async getAllAttractionTickets(): Promise<AttractionTicket[]> {
    const tickets = await AttractionTicketDao.getAllAttractionTickets();
    return Promise.all(tickets.map((ticket) => this.updateTicketStatusIfExpired(ticket)));
  }

  public async deleteAttractionTicket(id: string): Promise<void> {
    const existingTicket = await AttractionTicketDao.getAttractionTicketById(id);
    if (!existingTicket) {
      throw new Error('Attraction ticket not found');
    }
    await AttractionTicketDao.deleteAttractionTicket(id);
  }

  public async getAttractionTicketsByTransactionId(transactionId: string): Promise<AttractionTicket[]> {
    const tickets = await AttractionTicketDao.getAttractionTicketsByTransactionId(transactionId);

    const updatedTickets = await Promise.all(tickets.map((ticket) => this.updateTicketStatusIfExpired(ticket)));

    // Fetch the associated ticket listings
    const ticketsWithListings = await Promise.all(
      updatedTickets.map(async (ticket) => {
        const listing = await AttractionDao.getAttractionTicketListingById(ticket.attractionTicketListingId);
        return {
          ...ticket,
          attractionTicketListing: listing,
        };
      }),
    );

    return ticketsWithListings;
  }

  public async getAttractionTicketsByListingId(listingId: string): Promise<AttractionTicket[]> {
    const listing = await AttractionDao.getAttractionTicketListingById(listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    const tickets = await AttractionTicketDao.getAttractionTicketsByListingId(listingId);

    const updatedTickets = await Promise.all(tickets.map((ticket) => this.updateTicketStatusIfExpired(ticket)));

    // Fetch the associated ticket transactions
    const ticketsWithTransactions = await Promise.all(
      updatedTickets.map(async (ticket) => {
        const transaction = await AttractionTicketDao.getAttractionTicketTransactionById(ticket.attractionTicketTransactionId);
        return {
          ...ticket,
          attractionTicketTransaction: transaction,
        };
      }),
    );

    return ticketsWithTransactions;
  }

  public async updateAttractionTicketStatus(id: string, status: AttractionTicketStatusEnum): Promise<AttractionTicket> {
    const existingTicket = await AttractionTicketDao.getAttractionTicketById(id);
    if (!existingTicket) {
      throw new Error('Attraction ticket not found');
    }
    return AttractionTicketDao.updateAttractionTicketStatus(id, status);
  }

  public async getAttractionTicketsByAttractionId(
    attractionId: string,
  ): Promise<(AttractionTicket & { attractionTicketListing: AttractionTicketListing })[]> {
    const attraction = await AttractionDao.getAttractionById(attractionId);
    if (!attraction) {
      throw new Error('Attraction not found');
    }

    const tickets = await AttractionTicketDao.getAttractionTicketsByAttractionId(attractionId);

    const updatedTickets = await Promise.all(tickets.map((ticket) => this.updateTicketStatusIfExpired(ticket)));

    // Fetch the associated ticket listings
    const ticketsWithListings = await Promise.all(
      updatedTickets.map(async (ticket) => {
        const listing = await AttractionDao.getAttractionTicketListingById(ticket.attractionTicketListingId);
        return {
          ...ticket,
          attractionTicketListing: listing,
        };
      }),
    );

    return ticketsWithListings;
  }

  public async sendAttractionTicketEmail(transactionId: string, recipientEmail: string): Promise<void> {
    try {
      const transaction = await AttractionTicketDao.getAttractionTicketTransactionById(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      await EmailUtil.sendAttractionTicketEmail(recipientEmail, transaction);
    } catch (error) {
      throw new Error(`Failed to send attraction ticket email: ${error.message}`);
    }
  }

  public async sendRequestedAttractionTicketEmail(transactionId: string, recipientEmail: string): Promise<void> {
    try {
      const transaction = await AttractionTicketDao.getAttractionTicketTransactionById(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      await EmailUtil.sendRequestedAttractionTicketEmail(recipientEmail, transaction);
    } catch (error) {
      throw new Error(`Failed to send requested attraction ticket email: ${error.message}`);
    }
  }

  private async updateTicketStatusIfExpired(
    ticket: AttractionTicket & { attractionTicketTransaction?: AttractionTicketTransaction },
  ): Promise<AttractionTicket> {
    if (!ticket.attractionTicketTransaction) {
      ticket.attractionTicketTransaction = await AttractionTicketDao.getAttractionTicketTransactionById(
        ticket.attractionTicketTransactionId,
      );
    }

    const attractionDate = new Date(ticket.attractionTicketTransaction.attractionDate);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (ticket.status === AttractionTicketStatusEnum.VALID && attractionDate < yesterday) {
      return this.updateAttractionTicketStatus(ticket.id, AttractionTicketStatusEnum.INVALID);
    }

    return ticket;
  }

  public async verifyAttractionTicket(ticketId: string): Promise<boolean> {
    const ticket = await AttractionTicketDao.getAttractionTicketById(ticketId);
    const updatedTicket = await this.updateTicketStatusIfExpired(ticket);
    if (!updatedTicket) {
      throw new Error('Ticket not found');
    }

    const transaction = await AttractionTicketDao.getAttractionTicketTransactionById(updatedTicket.attractionTicketTransactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (updatedTicket.status === AttractionTicketStatusEnum.INVALID) {
      throw new Error('Ticket has expired and is no longer valid.');
    } else if (updatedTicket.status === AttractionTicketStatusEnum.USED) {
      throw new Error('Ticket has already been used and is no longer valid.');
    } else if (transaction.attractionDate > new Date()) {
      throw new Error(`Ticket is not yet valid, it is only valid on ${dayjs(transaction.attractionDate).format('DD MMMM YYYY')}.`);
    } else if (updatedTicket.status === AttractionTicketStatusEnum.VALID) {
      await AttractionTicketDao.updateAttractionTicketStatus(updatedTicket.id, AttractionTicketStatusEnum.USED);
      return true;
    } else {
      throw new Error('Ticket is not valid');
    }
  }
}

function ensureAllFieldsPresent(data: AttractionTicketTransactionSchemaType): Prisma.AttractionTicketTransactionCreateInput {
  if (!data.attractionDate || !data.purchaseDate || !data.totalAmount || !data.attractionId || !data.visitorId) {
    throw new Error('Missing required fields for attraction ticket transaction creation');
  }

  return data as Prisma.AttractionTicketTransactionCreateInput;
}

function ensureAllTicketFieldsPresent(data: AttractionTicketSchemaType): Prisma.AttractionTicketCreateInput {
  if (!data.status || !data.attractionTicketListingId || !data.attractionTicketTransactionId) {
    throw new Error('Missing required fields for attraction ticket transaction creation');
  }

  return data as Prisma.AttractionTicketCreateInput;
}

const dateFormatter = (data: any) => {
  const { attractionDate, purchaseDate, ...rest } = data;
  const formattedData = { ...rest };

  // Format dateObserved and dateOfBirth into JavaScript Date objects
  const attractionDateFormat = attractionDate ? new Date(attractionDate) : undefined;
  const purchaseDateFormat = purchaseDate ? new Date(purchaseDate) : undefined;
  if (attractionDate) {
    formattedData.attractionDate = attractionDateFormat;
  }
  if (purchaseDate) {
    formattedData.purchaseDate = purchaseDateFormat;
  }
  return formattedData;
};

export default new AttractionTicketService();
