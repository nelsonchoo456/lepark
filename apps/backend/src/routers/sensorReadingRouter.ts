import express from 'express';
import SensorReadingService from '../services/SensorReadingService';
import { SensorTypeEnum } from '@prisma/client';

const router = express.Router();

// Sensor Reading CRUD operations
router.post('/createSensorReading', async (req, res) => {
  try {
    const sensorReading = await SensorReadingService.createSensorReading(req.body);
    res.status(201).json(sensorReading);
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
    await SensorReadingService.deleteSensorReading(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sensor-specific routes
router.get('/getSensorReadingsBySensorId/:sensorId', async (req, res) => {
  try {
    const readings = await SensorReadingService.getSensorReadingsBySensorId(req.params.sensorId);
    res.status(200).json(readings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorReadingsBySensorIds', async (req, res) => {
  try {
    const sensorIds = Array.isArray(req.query.sensorIds) 
      ? req.query.sensorIds 
      : [req.query.sensorIds];

    const readings = await SensorReadingService.getSensorReadingsBySensorIds(sensorIds as string[]);
    res.status(200).json(readings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorReadingsHoursAgo/:sensorId/:hours', async (req, res) => {
  try {
    const readings = await SensorReadingService.getSensorReadingsHoursAgo(req.params.sensorId, parseInt(req.params.hours));
    res.status(200).json(readings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAverageSensorReadingsForHoursAgo/:sensorId/:hours', async (req, res) => {
  try {
    const average = await SensorReadingService.getAverageSensorReadingsForHoursAgo(req.params.sensorId, parseInt(req.params.hours));
    res.status(200).json({ average });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorReadingsByDateRange/:sensorId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const readings = await SensorReadingService.getSensorReadingsByDateRange(
      req.params.sensorId,
      new Date(startDate as string),
      new Date(endDate as string),
    );
    res.status(200).json(readings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getLatestSensorReadingBySensorId/:sensorId', async (req, res) => {
  try {
    const reading = await SensorReadingService.getLatestSensorReadingBySensorId(req.params.sensorId);
    res.status(200).json(reading);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorReadingTrendWithSlope/:sensorId/:hours', async (req, res) => {
  try {
    const trend = await SensorReadingService.getSensorReadingTrendWithSlope(req.params.sensorId, parseInt(req.params.hours));
    res.status(200).json({ trend });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getHourlyAverageSensorReadingsByDateRange/:sensorId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const hourlyAverages = await SensorReadingService.getHourlyAverageSensorReadingsByDateRange(
      req.params.sensorId,
      new Date(startDate as string),
      new Date(endDate as string),
    );
    res.status(200).json(hourlyAverages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Hub-specific routes
router.get('/getAllSensorReadingsByHubIdAndSensorType/:hubId/:sensorType', async (req, res) => {
  try {
    const readings = await SensorReadingService.getAllSensorReadingsByHubIdAndSensorType(
      req.params.hubId,
      req.params.sensorType as SensorTypeEnum,
    );
    res.status(200).json(readings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorReadingsByHubIdAndSensorTypeForHoursAgo/:hubId/:sensorType/:hours', async (req, res) => {
  try {
    const readings = await SensorReadingService.getSensorReadingsByHubIdAndSensorTypeForHoursAgo(
      req.params.hubId,
      req.params.sensorType as SensorTypeEnum,
      parseInt(req.params.hours),
    );
    res.status(200).json(readings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAverageSensorReadingsForHubIdAndSensorTypeForHoursAgo/:hubId/:sensorType/:hours', async (req, res) => {
  try {
    const average = await SensorReadingService.getAverageSensorReadingsForHubIdAndSensorTypeForHoursAgo(
      req.params.hubId,
      req.params.sensorType as SensorTypeEnum,
      parseInt(req.params.hours),
    );
    res.status(200).json({ average });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorReadingsByHubIdAndSensorTypeByDateRange/:hubId/:sensorType', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const readings = await SensorReadingService.getSensorReadingsByHubIdAndSensorTypeByDateRange(
      req.params.hubId,
      req.params.sensorType as SensorTypeEnum,
      new Date(startDate as string),
      new Date(endDate as string),
    );
    res.status(200).json(readings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getHourlyAverageSensorReadingsForHubIdAndSensorTypeByDateRange/:hubId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const readings = await SensorReadingService.getHourlyAverageSensorReadingsForHubIdAndSensorTypeByDateRange(
      req.params.hubId,
      new Date(startDate as string),
      new Date(endDate as string),
    );
    res.status(200).json(readings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getLatestSensorReadingByHubIdAndSensorType/:hubId/:sensorType', async (req, res) => {
  try {
    const reading = await SensorReadingService.getLatestSensorReadingByHubIdAndSensorType(
      req.params.hubId,
      req.params.sensorType as SensorTypeEnum,
    );
    res.status(200).json(reading);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Zone-specific routes
router.get('/getAllSensorReadingsByZoneIdAndSensorType/:zoneId/:sensorType', async (req, res) => {
  try {
    const readings = await SensorReadingService.getAllSensorReadingsByZoneIdAndSensorType(
      parseInt(req.params.zoneId),
      req.params.sensorType as SensorTypeEnum,
    );
    res.status(200).json(readings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorReadingsByZoneIdAndSensorTypeForHoursAgo/:zoneId/:sensorType/:hours', async (req, res) => {
  try {
    const readings = await SensorReadingService.getSensorReadingsByZoneIdAndSensorTypeForHoursAgo(
      parseInt(req.params.zoneId),
      req.params.sensorType as SensorTypeEnum,
      parseInt(req.params.hours),
    );
    res.status(200).json(readings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAverageSensorReadingsForZoneIdAndSensorTypeForHoursAgo/:zoneId/:sensorType/:hours', async (req, res) => {
  try {
    const average = await SensorReadingService.getAverageSensorReadingsForZoneIdAndSensorTypeForHoursAgo(
      parseInt(req.params.zoneId),
      req.params.sensorType as SensorTypeEnum,
      parseInt(req.params.hours),
    );
    res.status(200).json({ average });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAverageReadingsForZoneIdAcrossAllSensorTypesForHoursAgo/:zoneId/:hours', async (req, res) => {
  try {
    const averages = await SensorReadingService.getAverageReadingsForZoneIdAcrossAllSensorTypesForHoursAgo(
      parseInt(req.params.zoneId),
      parseInt(req.params.hours),
    );
    res.status(200).json(averages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAverageDifferenceBetweenPeriodsBySensorType/:zoneId/:duration', async (req, res) => {
  try {
    const changes = await SensorReadingService.getAverageDifferenceBetweenPeriodsBySensorType(
      parseInt(req.params.zoneId),
      parseInt(req.params.duration),
    );
    res.status(200).json(changes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorReadingsByZoneIdAndSensorTypeByDateRange/:zoneId/:sensorType', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const readings = await SensorReadingService.getSensorReadingsByZoneIdAndSensorTypeByDateRange(
      parseInt(req.params.zoneId),
      req.params.sensorType as SensorTypeEnum,
      new Date(startDate as string),
      new Date(endDate as string),
    );
    res.status(200).json(readings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getLatestSensorReadingByZoneIdAndSensorType/:zoneId/:sensorType', async (req, res) => {
  try {
    const reading = await SensorReadingService.getLatestSensorReadingByZoneIdAndSensorType(
      parseInt(req.params.zoneId),
      req.params.sensorType as SensorTypeEnum,
    );
    res.status(200).json(reading);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getZoneTrendForSensorType/:zoneId/:sensorType/:hours', async (req, res) => {
  try {
    const trend = await SensorReadingService.getZoneTrendForSensorType(
      parseInt(req.params.zoneId),
      req.params.sensorType as SensorTypeEnum,
      parseInt(req.params.hours),
    );
    res.status(200).json(trend);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getActiveZonePlantSensorCount/:zoneId/:hoursAgo?', async (req, res) => {
  try {
    const zoneId = parseInt(req.params.zoneId);
    const hoursAgo = req.params.hoursAgo ? parseInt(req.params.hoursAgo) : 1;
    const count = await SensorReadingService.getActiveZonePlantSensorCount(zoneId, hoursAgo);
    res.status(200).json({ count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getUnhealthyOccurrences/:zoneId', async (req, res) => {
  try {
    const zoneId = parseInt(req.params.zoneId);
    const occurrences = await SensorReadingService.getUnhealthyOccurrences(zoneId);
    res.status(200).json(occurrences);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Crowd Prediction Routes

router.get('/predictCrowdLevels/:parkId/:daysToPredict', async (req, res) => {
  try {
    const predictions = await SensorReadingService.predictCrowdLevels(parseInt(req.params.parkId), parseInt(req.params.daysToPredict));
    res.status(200).json(predictions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAggregatedCrowdDataForPark/:parkId/:startDate/:endDate', async (req, res) => {
  try {
    const data = await SensorReadingService.getAggregatedCrowdDataForPark(parseInt(req.params.parkId), new Date(req.params.startDate), new Date(req.params.endDate));
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllSensorReadingsByParkIdAndSensorType/:parkId/:sensorType', async (req, res) => {
  try {
    const readings = await SensorReadingService.getAllSensorReadingsByParkIdAndSensorType(parseInt(req.params.parkId), req.params.sensorType as SensorTypeEnum);
    res.status(200).json(readings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getPredictedCrowdLevelsForPark/:parkId/:pastPredictedDays', async (req, res) => {
  try {
    const data = await SensorReadingService.getPredictedCrowdLevelsForPark(parseInt(req.params.parkId), parseInt(req.params.pastPredictedDays));
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getPastOneHourCrowdDataBySensorsForPark/:parkId', async (req, res) => {
  try {
    const data = await SensorReadingService.getPastOneHourCrowdDataBySensorsForPark(parseInt(req.params.parkId));
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
