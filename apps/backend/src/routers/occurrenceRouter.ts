import express from 'express';
import OccurrenceService from '../services/OccurrenceService';
import { OccurrenceSchemaType } from '../schemas/occurrenceSchema';

const router = express.Router();

router.post('/createOccurrence', async (req, res) => {
  try {
    const occurrence = await OccurrenceService.createOccurrence(req.body);
    res.status(201).json(occurrence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllOccurrences', async (req, res) => {
  // http://localhost:3333/api/zones/getAllZones
  // http://localhost:3333/api/zones/getAllZones?parkId=<enter_oarkId_here>
  try {
    const parkId = req.query.parkId ? parseInt(req.query.parkId as string) : null;
    if (!parkId) {
      const occurrenceList = await OccurrenceService.getAllOccurrence();
      res.status(200).json(occurrenceList);
    } else {
      const occurrenceList = await OccurrenceService.getAllOccurrenceByParkId(parkId);
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

router.put('/updateOccurrenceDetails/:id', async (req, res) => {
  try {
    const occurrenceId = req.params.id;
    const updateData: Partial<OccurrenceSchemaType> = req.body;

    const updatedOccurrence = await OccurrenceService.updateOccurrenceDetails(occurrenceId, updateData);
    res.status(200).json(updatedOccurrence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteOccurrence/:id', async (req, res) => {
  try {
    const occurrenceId = req.params.id;
    const requesterId = req.body.requesterId; // Assuming requesterId is passed in the request body

    await OccurrenceService.deleteOccurrence(occurrenceId, requesterId);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
