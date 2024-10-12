import express from 'express';
import SensorReadingService from '../services/SensorReadingService';
import { SensorReadingSchemaType } from '../schemas/sensorReadingSchema';

const router = express.Router();

router.post('/createSensorReading', async (req, res) => {
  try {
    const sensorReading = await SensorReadingService.createSensorReading(req.body);
    res.status(201).json(sensorReading);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorReadingById/:id', async (req, res) => {
  try {
    const sensorReadingId = req.params.id;
    const sensorReading = await SensorReadingService.getSensorReadingById(sensorReadingId);
    res.status(200).json(sensorReading);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorReadingsByHubId/:hubId', async (req, res) => {
  try {
    const hubId = req.params.hubId;
    const sensorReadings = await SensorReadingService.getSensorReadingsByHubId(hubId);
    res.status(200).json(sensorReadings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorReadingsBySensorId/:sensorId', async (req, res) => {
  try {
    const sensorId = req.params.sensorId;
    const sensorReadings = await SensorReadingService.getSensorReadingsBySensorId(sensorId);
    res.status(200).json(sensorReadings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorReadingsByZoneId/:zoneId', async (req, res) => {
  try {
    const zoneId = parseInt(req.params.zoneId);
    const sensorReadings = await SensorReadingService.getSensorReadingsByZoneId(zoneId);
    res.status(200).json(sensorReadings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateSensorReading/:id', async (req, res) => {
  try {
    const updatedSensorReading = await SensorReadingService.updateSensorReading(req.params.id, req.body);
    res.status(200).json(updatedSensorReading);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteSensorReading/:id', async (req, res) => {
  try {
    const sensorReadingId = req.params.id;
    await SensorReadingService.deleteSensorReading(sensorReadingId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getLatestSensorReadingBySensorId/:sensorId', async (req, res) => {
  try {
    const sensorId = req.params.sensorId;
    const latestReading = await SensorReadingService.getLatestSensorReadingBySensorId(sensorId);
    res.status(200).json(latestReading);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorReadingsByDateRange/:sensorId', async (req, res) => {
  try {
    const sensorId = req.params.sensorId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    if (!sensorId || !startDate || !endDate) {
      return res.status(400).json({ error: 'sensorId, startDate, and endDate are required' });
    }
    const readings = await SensorReadingService.getSensorReadingsByDateRange(
      sensorId as string,
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.status(200).json(readings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorReadingsAverageForPastFourHours/:sensorId', async (req, res) => {
  try {
    const sensorId = req.params.sensorId;
    const readings = await SensorReadingService.getSensorReadingsAverageForPastFourHours(sensorId);
    res.status(200).json(readings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;