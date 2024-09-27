import { Router } from 'express';
import SequestrationHistoryService from '../services/SequestrationHistoryService';

const router = Router();

router.get('/area/:areaId', async (req, res) => {
  try {
    const history = await SequestrationHistoryService.getSequestrationHistoryByAreaId(req.params.areaId);
    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const history = await SequestrationHistoryService.createSequestrationHistory(req.body);
    res.status(201).json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const history = await SequestrationHistoryService.updateSequestrationHistory(req.params.id, req.body);
    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await SequestrationHistoryService.deleteSequestrationHistory(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;