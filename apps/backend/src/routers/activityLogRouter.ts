import express from 'express';
import ActivityLogService from '../services/ActivityLogService';
import { Prisma } from '@prisma/client';
import { ActivityLogSchemaType } from '../schemas/activityLogSchema';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.post('/createActivityLog', upload.array('files', 5), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const activityLogData = JSON.parse(req.body.data);

    const uploadedUrls = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const imageUrl = await ActivityLogService.uploadImageToS3(file.buffer, fileName, file.mimetype);
        uploadedUrls.push(imageUrl);
      }
    }

    const activityLog = await ActivityLogService.createActivityLog({
      ...activityLogData,
      images: uploadedUrls,
    });
    res.status(201).json(activityLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewActivityLogs/:occurrenceId', async (req, res) => {
  try {
    const occurrenceId = req.params.occurrenceId;
    const activityLogs = await ActivityLogService.getActivityLogsByOccurrenceId(occurrenceId);
    res.status(200).json(activityLogs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewActivityLogDetails/:id', async (req, res) => {
  try {
    const activityLogId = req.params.id;
    const activityLog = await ActivityLogService.getActivityLogById(activityLogId);
    res.status(200).json(activityLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateActivityLog/:id', async (req, res) => {
  try {
    const activityLogId = req.params.id;
    const updateData: Partial<ActivityLogSchemaType> = req.body;
    const updatedActivityLog = await ActivityLogService.updateActivityLog(activityLogId, updateData);
    res.status(200).json(updatedActivityLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteActivityLog/:id', async (req, res) => {
  try {
    const activityLogId = req.params.id;
    await ActivityLogService.deleteActivityLog(activityLogId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
