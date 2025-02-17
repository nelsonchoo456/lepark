import express from 'express';
import AttractionTicketService from '../services/AttractionTicketService';
import { AttractionTicketStatusEnum } from '@prisma/client';
import Stripe from 'stripe';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

// AttractionTicketTransaction routes
router.post('/createAttractionTicketTransaction', async (req, res) => {
  try {
    const transaction = await AttractionTicketService.createAttractionTicketTransaction(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllAttractionTicketTransaction', async (req, res) => {
  try {
    const transactions = await AttractionTicketService.getAllAttractionTicketTransactions();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewAttractionTicketTransactionDetails/:id', async (req, res) => {
  try {
    const transaction = await AttractionTicketService.getAttractionTicketTransactionById(req.params.id);
    res.status(200).json(transaction);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/getAttractionTicketTransactionsByVisitorId/:visitorId', async (req, res) => {
  try {
    const transactions = await AttractionTicketService.getAttractionTicketTransactionsByVisitorId(req.params.visitorId);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAttractionTicketTransactionsByAttractionId/:attractionId', async (req, res) => {
  try {
    const transactions = await AttractionTicketService.getAttractionTicketTransactionsByAttractionId(req.params.attractionId);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteAttractionTicketTransaction/:id', async (req, res) => {
  try {
    await AttractionTicketService.deleteAttractionTicketTransaction(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// AttractionTicket routes
router.post('/createAttractionTicket', async (req, res) => {
  try {
    const ticket = await AttractionTicketService.createAttractionTicket(req.body);
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewAttractionTicketDetails/:id', async (req, res) => {
  try {
    const ticket = await AttractionTicketService.getAttractionTicketById(req.params.id);
    res.status(200).json(ticket);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/getAllAttractionTickets', async (req, res) => {
  try {
    const tickets = await AttractionTicketService.getAllAttractionTickets();
    res.status(200).json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteAttractionTicket/:id', async (req, res) => {
  try {
    await AttractionTicketService.deleteAttractionTicket(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/getAttractionTicketsByTransactionId/:transactionId', async (req, res) => {
  try {
    const tickets = await AttractionTicketService.getAttractionTicketsByTransactionId(req.params.transactionId);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAttractionTicketsByListingId/:listingId', async (req, res) => {
  try {
    const tickets = await AttractionTicketService.getAttractionTicketsByListingId(req.params.listingId);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateAttractionTicketStatus/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const statusEnum = AttractionTicketStatusEnum[status as keyof typeof AttractionTicketStatusEnum];

    if (!statusEnum) {
      return res.status(400).json({ error: 'Invalid role.' });
    }
    const ticket = await AttractionTicketService.updateAttractionTicketStatus(req.params.id, statusEnum);
    res.status(200).json(ticket);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/create-payment-intent', async (req, res) => {
  try {
    // Validate the request body
    const { total } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents and ensure it's an integer
      currency: 'sgd',
      automatic_payment_methods: {
        enabled: true,
      },
      description: 'Attraction ticket transaction',
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

    // let paymentType = 'UNKNOWN';
    // if (paymentIntent.payment_method) {
    //   const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method as string);
    //   paymentType = paymentMethod.type.toUpperCase();
    // } else if (paymentIntent.payment_method_types.includes('paynow')) {
    //   paymentType = 'PAYNOW';
    // }

    res.status(200).json({
      amount: paymentIntent.amount,
      // type: paymentType,
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

router.post('/sendAttractionTicketEmail', async (req, res) => {
  try {
    const { transactionId, recipientEmail } = req.body;

    if (!transactionId || !recipientEmail) {
      return res.status(400).json({ error: 'Transaction ID and recipient email are required' });
    }

    await AttractionTicketService.sendAttractionTicketEmail(transactionId, recipientEmail);
    res.status(200).json({ message: 'Attraction ticket email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sendRequestedAttractionTicketEmail', async (req, res) => {
  try {
    const { transactionId, recipientEmail } = req.body;

    if (!transactionId || !recipientEmail) {
      return res.status(400).json({ error: 'Transaction ID and recipient email are required' });
    }

    await AttractionTicketService.sendRequestedAttractionTicketEmail(transactionId, recipientEmail);
    res.status(200).json({ message: 'Attraction ticket email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/getAttractionTicketsByAttractionId/:attractionId', async (req, res) => {
  try {
    const tickets = await AttractionTicketService.getAttractionTicketsByAttractionId(req.params.attractionId);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/verify-attraction-ticket/:ticketId', async (req, res) => {
  const { ticketId } = req.params;
  try {
    const isValid = await AttractionTicketService.verifyAttractionTicket(ticketId);
    res.status(200).send({ isValid });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

export default router;