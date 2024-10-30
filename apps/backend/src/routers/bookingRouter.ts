import express from 'express';
import BookingService from '../services/BookingService';
import { BookingStatusEnum } from '@prisma/client';

const router = express.Router();

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

export default router;
