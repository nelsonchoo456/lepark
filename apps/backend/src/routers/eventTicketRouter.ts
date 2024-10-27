import express from 'express';
import EventTicketService from '../services/EventTicketService';
import { EventTicketStatusEnum } from '@prisma/client';
import Stripe from 'stripe';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

// EventTicketTransaction routes
router.post('/createEventTicketTransaction', async (req, res) => {
  try {
    const transaction = await EventTicketService.createEventTicketTransaction(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllEventTicketTransaction', async (req, res) => {
  try {
    const transactions = await EventTicketService.getAllEventTicketTransactions();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewEventTicketTransactionDetails/:id', async (req, res) => {
  try {
    const transaction = await EventTicketService.getEventTicketTransactionById(req.params.id);
    res.status(200).json(transaction);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/getEventTicketTransactionsByVisitorId/:visitorId', async (req, res) => {
  try {
    const transactions = await EventTicketService.getEventTicketTransactionsByVisitorId(req.params.visitorId);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getEventTicketTransactionsByEventId/:eventId', async (req, res) => {
  try {
    const transactions = await EventTicketService.getEventTicketTransactionsByEventId(req.params.eventId);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteEventTicketTransaction/:id', async (req, res) => {
  try {
    await EventTicketService.deleteEventTicketTransaction(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// EventTicket routes
router.post('/createEventTicket', async (req, res) => {
  try {
    const ticket = await EventTicketService.createEventTicket(req.body);
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewEventTicketDetails/:id', async (req, res) => {
  try {
    const ticket = await EventTicketService.getEventTicketById(req.params.id);
    res.status(200).json(ticket);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/getAllEventTickets', async (req, res) => {
  try {
    const tickets = await EventTicketService.getAllEventTickets();
    res.status(200).json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteEventTicket/:id', async (req, res) => {
  try {
    await EventTicketService.deleteEventTicket(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/getEventTicketsByTransactionId/:transactionId', async (req, res) => {
  try {
    const tickets = await EventTicketService.getEventTicketsByTransactionId(req.params.transactionId);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getEventTicketsByListingId/:listingId', async (req, res) => {
  try {
    const tickets = await EventTicketService.getEventTicketsByListingId(req.params.listingId);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateEventTicketStatus/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const statusEnum = EventTicketStatusEnum[status as keyof typeof EventTicketStatusEnum];

    if (!statusEnum) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    const ticket = await EventTicketService.updateEventTicketStatus(req.params.id, statusEnum);
    res.status(200).json(ticket);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { total } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'sgd',
      automatic_payment_methods: {
        enabled: true,
      },
      description: 'Event ticket transaction',
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

router.get('/stripe-key', (_, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

router.get('/fetchPayment/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const paymentIntent = await stripe.paymentIntents.retrieve(id);

    res.status(200).json({
      amount: paymentIntent.amount,
      description: paymentIntent.description,
      status: paymentIntent.status,
      secret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    if (error instanceof Stripe.errors.StripeError) {
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'An unexpected error occurred while fetching payment information' });
  }
});

router.post('/sendEventTicketEmail', async (req, res) => {
  try {
    const { transactionId, recipientEmail } = req.body;

    if (!transactionId || !recipientEmail) {
      return res.status(400).json({ error: 'Transaction ID and recipient email are required' });
    }

    await EventTicketService.sendEventTicketEmail(transactionId, recipientEmail);
    res.status(200).json({ message: 'Event ticket email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/getEventTicketsByEventId/:eventId', async (req, res) => {
  try {
    const tickets = await EventTicketService.getEventTicketsByEventId(req.params.eventId);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/verify-event-ticket/:ticketId', async (req, res) => {
  const { ticketId } = req.params;
  try {
    const isValid = await EventTicketService.verifyEventTicket(ticketId);
    res.status(200).send({ isValid });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

export default router;
