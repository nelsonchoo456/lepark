import express from 'express';
import OccurrenceService from '../services/OccurrenceService';
import { OccurrenceSchemaType } from '../schemas/occurrenceSchema';
import multer from 'multer';
import { authenticateJWTStaff } from '../middleware/authenticateJWT';

const router = express.Router();
const upload = multer();

router.post('/createOccurrence', authenticateJWTStaff, async (req, res) => {
  try {
    const occurrence = await OccurrenceService.createOccurrence(req.body);
    res.status(201).json(occurrence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllOccurrences', async (req, res) => {
  // http://localhost:3333/api/zones/getAllZones
  // http://localhost:3333/api/zones/getAllZones?parkId=<enter_parkId_here>
  // http://localhost:3333/api/zones/getAllZones?zoneId=<enter_zoneId_here>
  try {
    const parkId = req.query.parkId ? parseInt(req.query.parkId as string) : null;
    const zoneId = req.query.zoneId ? parseInt(req.query.zoneId as string) : null;

    if (zoneId) {
      const occurrenceList = await OccurrenceService.getAllOccurrenceByZoneId(zoneId);
      res.status(200).json(occurrenceList);
    } else if (parkId) {
      const occurrenceList = await OccurrenceService.getAllOccurrenceByParkId(parkId);
      res.status(200).json(occurrenceList);
    } else {
      const occurrenceList = await OccurrenceService.getAllOccurrence();
      res.status(200).json(occurrenceList);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewOccurrenceDetails/:id', async (req, res) => {
  try {
    const occurrenceId = req.params.id;
    const occurrence = await OccurrenceService.getOccurrenceById(occurrenceId);
    res.status(200).json(occurrence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateOccurrenceDetails/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const occurrenceId = req.params.id;
    const updateData: Partial<OccurrenceSchemaType> = req.body;

    const updatedOccurrence = await OccurrenceService.updateOccurrenceDetails(occurrenceId, updateData);
    res.status(200).json(updatedOccurrence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteOccurrence/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const occurrenceId = req.params.id;
    const requesterId = req.body.requesterId; // Assuming requesterId is passed in the request body

    await OccurrenceService.deleteOccurrence(occurrenceId, requesterId);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/upload', upload.array('files', 5), async (req, res) => {
  try {
    // Use a type assertion to tell TypeScript that req.file exists
    const files = req.files as Express.Multer.File[];

    // Check if a file is provided
    if (!files || files.length === 0) {
      // return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedUrls = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`; // Create a unique file name
      const imageUrl = await OccurrenceService.uploadImageToS3(file.buffer, fileName, file.mimetype);
      uploadedUrls.push(imageUrl);
    }

    // Return the image URL
    res.status(200).json({ uploadedUrls });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
