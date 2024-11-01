import express from 'express';
import FeedbackService from '../services/FeedbackService';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.post('/createFeedback', async (req, res) => {
  try {
    const feedback = await FeedbackService.createFeedback(req.body);
    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllFeedback/', async (req, res) => {
  try {
    const feedbacks = await FeedbackService.getAllFeedback();
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllFeedback/:visitorId', async (req, res) => {
  try {
    const feedbacks = await FeedbackService.getAllFeedback(req.params.visitorId);
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getFeedbackById/:id', async (req, res) => {
  try {
    const feedback = await FeedbackService.getFeedbackById(req.params.id);
    res.status(200).json(feedback);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateFeedback/:id', async (req, res) => {
  try {
    const feedback = await FeedbackService.updateFeedback(req.params.id, req.body);
    res.status(200).json(feedback);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteFeedback/:id', async (req, res) => {
  try {
    await FeedbackService.deleteFeedback(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/upload', upload.array('files', 5), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedUrls = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const imageUrl = await FeedbackService.uploadImageToS3(file.buffer, fileName, file.mimetype);
      uploadedUrls.push(imageUrl);
    }

    res.status(200).json({ uploadedUrls });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.get('/getFeedbackByParkId/:parkId', async (req, res) => {
  try {
    const feedbacks = await FeedbackService.getFeedbackByParkId(parseInt(req.params.parkId));
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
