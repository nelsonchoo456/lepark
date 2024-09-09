import express from 'express';
import OccurrenceService from '../services/OccurrenceService';
import { Prisma } from '@prisma/client';
import { OccurrenceSchemaType, ActivityLogSchemaType } from '../schemas/occurrenceSchema';

const router = express.Router();

router.post('/createOccurrence', async (req, res) => {
  try {
    const occurrence = await OccurrenceService.createOccurrence(req.body);
    res.status(201).json(occurrence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllOccurrences', async (_, res) => {
  try {
    const occurrenceList = await OccurrenceService.getAllOccurrence();
    res.status(200).json(occurrenceList);
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

/* ACTIVITY LOG ROUTES */

router.post('/createActivityLog', async (req, res) => {
  try {
    const activityLog = await OccurrenceService.createActivityLog(req.body);
    res.status(201).json(activityLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewActivityLogs/:occurrenceId', async (req, res) => {
  try {
    const occurrenceId = req.params.occurrenceId;
    const activityLogs = await OccurrenceService.getActivityLogsByOccurrenceId(occurrenceId);
    res.status(200).json(activityLogs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewActivityLogDetails/:id', async (req, res) => {
  try {
    const activityLogId = req.params.id;
    const activityLog = await OccurrenceService.getActivityLogById(activityLogId);
    res.status(200).json(activityLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateActivityLog/:id', async (req, res) => {
  try {
    const activityLogId = req.params.id;
    const updateData: Partial<ActivityLogSchemaType> = req.body;
    const updatedActivityLog = await OccurrenceService.updateActivityLog(activityLogId, updateData);
    res.status(200).json(updatedActivityLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteActivityLog/:id', async (req, res) => {
  try {
    const activityLogId = req.params.id;
    await OccurrenceService.deleteActivityLog(activityLogId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
