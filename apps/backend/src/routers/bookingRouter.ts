import express from 'express';
import BookingService from '../services/BookingService';
import { BookingStatusEnum } from '@prisma/client';
import Stripe from 'stripe';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

router.post('/createBooking', async (req, res) => {
  try {
    const booking = await BookingService.createBooking(req.body);
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewBookingDetails/:id', async (req, res) => {
  try {
    const booking = await BookingService.getBookingById(req.params.id);
    res.status(200).json(booking);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/getAllBookings', async (req, res) => {
  try {
    const bookings = await BookingService.getAllBookings();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateBookingStatus/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const statusEnum = BookingStatusEnum[status as keyof typeof BookingStatusEnum];

    if (!statusEnum) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const booking = await BookingService.updateBookingStatus(req.params.id, statusEnum);
    res.status(200).json(booking);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.delete('/deleteBooking/:id', async (req, res) => {
  try {
    await BookingService.deleteBooking(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/getBookingsByVisitorId/:visitorId', async (req, res) => {
  try {
    const bookings = await BookingService.getBookingsByVisitorId(req.params.visitorId);
    res.status(200).json(bookings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getBookingsByFacilityId/:facilityId', async (req, res) => {
  try {
    const bookings = await BookingService.getBookingsByFacilityId(req.params.facilityId);
    res.status(200).json(bookings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getBookingsByParkId/:parkId', async (req, res) => {
  try {
    const parkId = parseInt(req.params.parkId);
    const bookings = await BookingService.getBookingsByParkId(parkId);
    res.status(200).json(bookings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateBooking/:id', async (req, res) => {
  try {
    const booking = await BookingService.updateBooking(req.params.id, req.body);
    res.status(200).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
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

router.post('/sendBookingEmail', async (req, res) => {
  try {
    const { bookingId, recipientEmail } = req.body;

    if (!bookingId || !recipientEmail) {
      return res.status(400).json({ error: 'Booking ID and recipient email are required' });
    }

    await BookingService.sendBookingEmail(bookingId, recipientEmail);
    res.status(200).json({ message: 'Booking email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sendRequestedBookingEmail', async (req, res) => {
  try {
    const { bookingId, recipientEmail } = req.body;

    if (!bookingId || !recipientEmail) {
      return res.status(400).json({ error: 'Booking ID and recipient email are required' });
    }

    await BookingService.sendRequestedBookingEmail(bookingId, recipientEmail);
    res.status(200).json({ message: 'Booking email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
