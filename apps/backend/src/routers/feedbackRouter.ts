import express from 'express';
import FeedbackService from './FeedbackService';

const router = express.Router();

router.post('/createFeedback', async (req, res) => {
  try {
    const feedback = await FeedbackService.createFeedback(req.body);
    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllFeedbacks/:visitorId', async (req, res) => {
  try {
    const feedbacks = await FeedbackService.getAllFeedbacks(req.params.visitorId);
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

export default router;
