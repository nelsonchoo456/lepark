import { Router } from 'express';
import SequestrationHistoryService from '../services/SequestrationHistoryService';

const router = Router();

router.post('/createSequestrationHistory', async (req, res) => {
  try {
    const history = await SequestrationHistoryService.createSequestrationHistory(req.body);
    res.status(201).json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateSequestrationHistory/:id', async (req, res) => {
  try {
    const history = await SequestrationHistoryService.updateSequestrationHistory(req.params.id, req.body);
    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteSequestrationHistory/:id', async (req, res) => {
  try {
    await SequestrationHistoryService.deleteSequestrationHistory(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/area/:areaId', async (req, res) => {
  try {
    const history = await SequestrationHistoryService.getSequestrationHistoryByAreaId(req.params.areaId);
    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/area/:areaId/timeframe', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const history = await SequestrationHistoryService.getSequestrationHistoryByAreaIdAndTimeFrame(
      req.params.areaId,
      startDate as string,
      endDate as string,
    );
    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/generateSequestrationHistory/:areaId', async (req, res) => {
  try {
    await SequestrationHistoryService.generateSequestrationHistoryForArea(req.params.areaId);
    res.status(200).json({ message: 'Sequestration history report generated successfully.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
