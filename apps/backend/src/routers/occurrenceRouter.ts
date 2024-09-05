import express from 'express';
import OccurenceService from '../services/OccurenceService';
import { Prisma } from '@prisma/client';
import { OccurrenceSchemaType } from '../schemas/occurrenceSchema';

const router = express.Router();

router.post('/createOccurrence', async (req, res) => {
  try {
    const occurrence = await OccurenceService.createOccurrence(req.body);
    res.status(201).json(occurrence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllOccurrences', async (_, res) => {
  try {
    const occurrenceList = await OccurenceService.getAllOccurrence();
    res.status(200).json(occurrenceList);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewOccurrenceDetails/:id', async (req, res) => {
  try {
    const occurrenceId = req.params.id;
    const occurrence = await OccurenceService.getOccurrenceById(occurrenceId);
    res.status(200).json(occurrence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateOccurrenceDetails/:id', async (req, res) => {
  try {
    const occurrenceId = req.params.id;
    const updateData: Partial<OccurrenceSchemaType> = req.body;

    const updatedOccurrence = await OccurenceService.updateOccurrenceDetails(occurrenceId, updateData);
    res.status(200).json(updatedOccurrence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteOccurrence/:id', async (req, res) => {
  try {
    const occurrenceId = req.params.id;
    const requesterId = req.body.requesterId; // Assuming requesterId is passed in the request body

    await OccurenceService.deleteOccurrence(occurrenceId, requesterId);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
