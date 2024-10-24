import express from 'express';
import PredictedWaterScheduleService from '../services/PredictedWaterScheduleService';

const router = express.Router();

router.post('/generatePredictedWaterSchedule', async (req, res) => {
  try {
    const { hubId, days } = req.body;
    const schedules = await PredictedWaterScheduleService.generatePredictedWaterSchedule(hubId, days);
    res.status(201).json(schedules);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getPredictedWaterSchedulesByHubId/:hubId', async (req, res) => {
  try {
    const schedules = await PredictedWaterScheduleService.getPredictedWaterSchedulesByHubId(req.params.hubId);
    res.status(200).json(schedules);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getPredictedWaterSchedulesByDateRange', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const schedules = await PredictedWaterScheduleService.getPredictedWaterSchedulesByDateRange(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.status(200).json(schedules);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updatePredictedWaterSchedule/:id', async (req, res) => {
  try {
    const updatedSchedule = await PredictedWaterScheduleService.updatePredictedWaterSchedule(req.params.id, req.body);
    res.status(200).json(updatedSchedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deletePredictedWaterSchedule/:id', async (req, res) => {
  try {
    await PredictedWaterScheduleService.deletePredictedWaterSchedule(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
