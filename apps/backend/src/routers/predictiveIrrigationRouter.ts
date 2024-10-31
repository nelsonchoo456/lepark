import express, { Request, Response } from 'express';
import PredictiveIrrigationService from '../services/PredictiveIrrigationService';
import HubDao from '../dao/HubDao';
import HubService from '../services/HubService';

const router = express.Router();

// Get predicted irrigation for today by hubId
router.get('/getHistoricalSensorsRainfallData/:hubId', async (req: Request, res: Response) => {
  const { hubId } = req.params;
  const { startDate, endDate } = req.query;

  const parsedStartDate = new Date(startDate as string);
  const parsedEndDate = new Date(endDate as string);
  // Check for invalid dates
  if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  try {
    const hub = await HubService.getHubById(hubId);

    if (!hub) {
      return res.status(404).json({ error: 'Hub not found' });
    }

    const data = await PredictiveIrrigationService.getHubHistoricalSensorsRainfallData(hub, parsedStartDate,
      parsedEndDate);

    if (data === null) {
      return res.status(404).json({ message: 'No data found for this hub.' });
    }

    res.json({ hubId, data });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data: ' + error });
  }
});

router.get('/getHubHistoricalRainfallData/:hubId', async (req: Request, res: Response) => {
  const { hubId } = req.params;
  const { startDate, endDate } = req.query;

  const parsedStartDate = new Date(startDate as string);
  const parsedEndDate = new Date(endDate as string);
  // Check for invalid dates
  if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  try {
    const hub = await HubService.getHubById(hubId);

    if (!hub) {
      return res.status(404).json({ error: 'Hub not found' });
    }

    const data = await PredictiveIrrigationService.getHubHistoricalRainfallData(hub, parsedStartDate,
      parsedEndDate);

    if (data === null) {
      return res.status(404).json({ message: 'No rain data found for this hub.' });
    }

    res.json({ hubId, data });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data: ' + error });
  }
});

router.get('/get4DayWeatherForecast', async (req: Request, res: Response) => {
  try {

    const data = await PredictiveIrrigationService.get4DayWeatherForecast();
    res.json(data);
  } catch (error) {
    console.error('Error fetching predicted irrigation:', error);
    res.status(500).json({ error: 'Failed to fetch predicted irrigation: ' + error });
  }
});

// Get predicted irrigation for today by hubId
router.get('/predictionForHub/:hubId', async (req: Request, res: Response) => {
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

    res.json({ hubId, ...predictedIrrigation });
  } catch (error) {
    console.error('Error fetching predicted irrigation:', error);
    res.status(500).json({ error: 'Failed to fetch predicted irrigation' });
  }
});

router.get('/trainModelForHub/:hubId', async (req: Request, res: Response) => {
  const { hubId } = req.params;

  try {
    const hub = await HubService.getHubById(hubId);

    if (!hub) {
      return res.status(404).json({ error: 'Hub not found' });
    } else if (hub.hubStatus !== "ACTIVE") {
      return res.status(404).json({ error: 'Hub is not active' });
    }

    await PredictiveIrrigationService.trainModelForHub(hub);
    
    res.status(200).json({ message: `Model saved to database for hub: ${hubId}` })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/getModelForHub/:hubId', async (req: Request, res: Response) => {
  const { hubId } = req.params;

  try {
    const hub = await HubService.getHubById(hubId);

    if (!hub) {
      return res.status(404).json({ error: 'Hub not found' });
    } else if (hub.hubStatus !== "ACTIVE") {
      return res.status(404).json({ error: 'Hub is not active' });
    }

    const rfModel = await PredictiveIrrigationService.getModelForHub(hubId);
    
    res.status(200).json({ rfModel })
  } catch (error) {
    res.status(500).json({ error: error.message });
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
