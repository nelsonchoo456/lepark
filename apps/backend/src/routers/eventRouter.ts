import express from 'express';
import EventService from '../services/EventService';
import { EventSchemaType } from '../schemas/eventSchema';
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

export default router;
