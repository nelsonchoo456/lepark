import express from 'express';
import SensorService from '../services/SensorService';
import { SensorSchemaType } from '../schemas/sensorSchema';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.post('/createSensor', async (req, res) => {
  try {
    const sensor = await SensorService.createSensor(req.body);
    res.status(201).json(sensor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllSensors', async (req, res) => {
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
    res.status(200).json(sensor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateSensor/:id', async (req, res) => {
  try {
    const updatedSensor = await SensorService.updateSensor(req.params.id, req.body);
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

router.get('/getSensorsByFacilityId/:facilityId', async (req, res) => {
  try {
    const facilityId = req.params.facilityId;
    const sensors = await SensorService.getSensorsByFacilityId(facilityId);
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

router.post('/upload', upload.array('files', 1), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedUrls = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const imageUrl = await SensorService.uploadImageToS3(file.buffer, fileName, file.mimetype);
      uploadedUrls.push(imageUrl);
    }

    res.status(200).json({ uploadedUrls });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.get('/getSensorsByParkId/:parkId', async (req, res) => {
  try {
    const parkId = parseInt(req.params.parkId);
    const sensors = await SensorService.getSensorsByParkId(parkId);
    res.status(200).json(sensors);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



export default router;
