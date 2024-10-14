import express from 'express';
import IoTService from '../services/IoTService';

const router = express.Router();


router.get('/getEnvironmentalAlerts/:zoneId', async (req, res) => {
  try {
    const zoneId = parseInt(req.params.zoneId);
    const unhealthyOccurrences = await IoTService.getUnhealthyOccurrences(zoneId);
    res.json(unhealthyOccurrences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;
