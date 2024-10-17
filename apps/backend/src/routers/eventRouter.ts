import express from 'express';
import EventService from '../services/EventService';
import { EventSchemaType, EventTicketListingSchemaType } from '../schemas/eventSchema';
import multer from 'multer';
import { authenticateJWTStaff } from '../middleware/authenticateJWT';

const router = express.Router();
const upload = multer();

router.post('/createEvent', authenticateJWTStaff, async (req, res) => {
  try {
    const event = await EventService.createEvent(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllEvents', async (req, res) => {
  try {
    const events = await EventService.getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getEventsByParkId/:parkId', async (req, res) => {
  try {
    const parkId = req.params.parkId;
    const events = await EventService.getEventsByParkId(parkId);
    res.status(200).json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getEventCountByParkId/:parkId', async (req, res) => {
  try {
    const parkId = req.params.parkId;
    const events = await EventService.getEventCountByParkId(parkId);
    res.status(200).json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get('/getEventsByFacilityId/:facilityId', async (req, res) => {
  try {
    const facilityId = req.params.facilityId;
    const events = await EventService.getEventsByFacilityId(facilityId);
    res.status(200).json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getEventById/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await EventService.getEventById(eventId);
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateEventDetails/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateData: Partial<EventSchemaType> = req.body;
    const updatedEvent = await EventService.updateEventDetails(eventId, updateData);
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteEvent/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const eventId = req.params.id;
    await EventService.deleteEvent(eventId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/upload', upload.array('files', 5), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      // return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedUrls = [];
    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const imageUrl = await EventService.uploadImageToS3(file.buffer, fileName, file.mimetype);
      uploadedUrls.push(imageUrl);
    }

    res.status(200).json({ uploadedUrls });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.post('/createEventTicketListing', authenticateJWTStaff, async (req, res) => {
  try {
    const ticketListing = await EventService.createEventTicketListing(req.body);
    res.status(201).json(ticketListing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllEventTicketListings', async (req, res) => {
  try {
    const ticketListings = await EventService.getAllEventTicketListings();
    res.status(200).json(ticketListings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getEventTicketListingsByEventId/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const ticketListings = await EventService.getEventTicketListingsByEventId(eventId);
    res.status(200).json(ticketListings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getEventTicketListingById/:id', async (req, res) => {
  try {
    const ticketListingId = req.params.id;
    const ticketListing = await EventService.getEventTicketListingById(ticketListingId);
    res.status(200).json(ticketListing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateEventTicketListingDetails/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const ticketListingId = req.params.id;
    const updateData: Partial<EventTicketListingSchemaType> = req.body;
    const updatedTicketListing = await EventService.updateEventTicketListingDetails(ticketListingId, updateData);
    res.status(200).json(updatedTicketListing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteEventTicketListing/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const ticketListingId = req.params.id;
    await EventService.deleteEventTicketListing(ticketListingId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
