import express from 'express';
import SensorService from '../services/SensorService';
import { SensorSchema, SensorSchemaType } from '../schemas/sensorSchema';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.post('/createSensor', async (req, res) => {
  try {
    const sensorData = SensorSchema.parse(req.body);
    const sensor = await SensorService.createSensor(sensorData);
    res.status(201).json(sensor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllSensors', async (_, res) => {
  try {
    const sensors = await SensorService.getAllSensors();
    res.status(200).json(sensors);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorById/:id', async (req, res) => {
  try {
    const sensorId = req.params.id;
    const sensor = await SensorService.getSensorById(sensorId);
    if (sensor) {
      res.status(200).json(sensor);
    } else {
      res.status(404).json({ error: 'Sensor not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateSensor/:id', async (req, res) => {
  try {
    const sensorId = req.params.id;
    const updateData: Partial<SensorSchemaType> = req.body;
    const updatedSensor = await SensorService.updateSensor(sensorId, updateData);
    res.status(200).json(updatedSensor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteSensor/:id', async (req, res) => {
  try {
    const sensorId = req.params.id;
    await SensorService.deleteSensor(sensorId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorsByHubId/:hubId', async (req, res) => {
  try {
    const hubId = req.params.hubId;
    const sensors = await SensorService.getSensorsByHubId(hubId);
    res.status(200).json(sensors);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorsNeedingCalibration', async (_, res) => {
  try {
    const sensors = await SensorService.getSensorsNeedingCalibration();
    res.status(200).json(sensors);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorsNeedingMaintenance', async (_, res) => {
  try {
    const sensors = await SensorService.getSensorsNeedingMaintenance();
    res.status(200).json(sensors);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileName = `${Date.now()}-${file.originalname}`;
    const imageUrl = await SensorService.uploadImageToS3(file.buffer, fileName, file.mimetype);
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
