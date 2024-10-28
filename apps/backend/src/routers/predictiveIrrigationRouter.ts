import express, { Request, Response } from 'express';
import PredictiveIrrigationService from '../services/PredictiveIrrigationService';
import HubDao from '../dao/HubDao';
import HubService from '../services/HubService';

const router = express.Router();

// Get predicted irrigation for today by hubId
router.get('/today/:hubId', async (req: Request, res: Response) => {
  const { hubId } = req.params;

  try {
    const hub = await HubService.getHubById(hubId);

    if (!hub) {
      return res.status(404).json({ error: 'Hub not found' });
    }

    const predictedIrrigation = await PredictiveIrrigationService.getPredictedIrrigationForToday(hub);

    if (predictedIrrigation === null) {
      return res.status(404).json({ message: 'No prediction available for today' });
    }

    res.json({ hubId, predictedIrrigation });
  } catch (error) {
    console.error('Error fetching predicted irrigation:', error);
    res.status(500).json({ error: 'Failed to fetch predicted irrigation' });
  }
});

// Reload all models from the database
// router.post('/reload-models', async (req: Request, res: Response) => {
//   try {
//     await PredictiveIrrigationService.loadAllModels();
//     res.json({ message: 'Models reloaded successfully' });
//   } catch (error) {
//     console.error('Error reloading models:', error);
//     res.status(500).json({ error: 'Failed to reload models' });
//   }
// });

export default router;
