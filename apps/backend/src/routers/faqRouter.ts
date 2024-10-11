import express from 'express';
import FAQService from '../services/FAQService';

const router = express.Router();

router.post('/createFAQ', async (req, res) => {
  try {
    const faq = await FAQService.createFAQ(req.body);
    res.status(201).json(faq);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getFAQById/:id', async (req, res) => {
  try {
    const faq = await FAQService.getFAQById(req.params.id);
    res.status(200).json(faq);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateFAQ/:id', async (req, res) => {
  try {
    const faq = await FAQService.updateFAQ(req.params.id, req.body);
    res.status(200).json(faq);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteFAQ/:id', async (req, res) => {
  try {
    await FAQService.deleteFAQ(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllFAQs', async (req, res) => {
  try {
    const faqs = await FAQService.getAllFAQs();
    res.status(200).json(faqs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getFAQsByParkId/:parkId', async (req, res) => {
  try {
    const parkId = parseInt(req.params.parkId);
    const faqs = await FAQService.getFAQsByParkId(parkId);
    res.status(200).json(faqs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateFAQPriorities', async (req, res) => {
  try {
    const { faqs } = req.body;
    await FAQService.updateFAQPriorities(faqs);
    res.status(200).send('Priorities updated successfully');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
