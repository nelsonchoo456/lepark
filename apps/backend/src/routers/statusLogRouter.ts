import express from 'express';
import StatusLogService from '../services/StatusLogService';
import { Prisma } from '@prisma/client';
import { StatusLogSchemaType } from '../schemas/statusLogSchema';

const router = express.Router();

router.post('/createStatusLog', async (req, res) => {
  try {
    const statusLog = await StatusLogService.createStatusLog(req.body);
    res.status(201).json(statusLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewStatusLogs/:occurrenceId', async (req, res) => {
  try {
    const occurrenceId = req.params.occurrenceId;
    const statusLogs = await StatusLogService.getStatusLogsByOccurrenceId(occurrenceId);
    res.status(200).json(statusLogs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewStatusLogDetails/:id', async (req, res) => {
  try {
    const statusLogId = req.params.id;
    const statusLog = await StatusLogService.getStatusLogById(statusLogId);
    res.status(200).json(statusLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateStatusLog/:id', async (req, res) => {
  try {
    const statusLogId = req.params.id;
    const updateData: Partial<StatusLogSchemaType> = req.body;
    const updatedStatusLog = await StatusLogService.updateStatusLog(statusLogId, updateData);
    res.status(200).json(updatedStatusLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteStatusLog/:id', async (req, res) => {
  try {
    const statusLogId = req.params.id;
    await StatusLogService.deleteStatusLog(statusLogId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
