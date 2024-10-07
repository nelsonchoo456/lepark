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

router.put('/updateSensorDetails/:id', async (req, res) => {
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

router.get('/getSensorsNeedingMaintenance', async (_, res) => {
  try {
    const sensors = await SensorService.getSensorsNeedingMaintenance();
    res.status(200).json(sensors);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/upload', upload.array('files', 5), async (req, res) => {
  try {
    // Use a type assertion to tell TypeScript that req.files exists
    const files = req.files as Express.Multer.File[];

    const uploadedUrls: string[] = [];

    // Only process files if they exist
    if (files && files.length > 0) {
      for (const file of files) {
        const fileName = `${Date.now()}-${file.originalname}`; // Create a unique file name
        const imageUrl = await SensorService.uploadImageToS3(file.buffer, fileName, file.mimetype);
        uploadedUrls.push(imageUrl);
      }
    }

    // Return the image URLs (empty array if no files were uploaded)
    res.status(200).json({ uploadedUrls });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'Failed to process upload' });
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

router.get('/getSensorByIdentifierNumber/:identifierNumber', async (req, res) => {
  try {
    const identifierNumber = req.params.identifierNumber;
    const sensor = await SensorService.getSensorByIdentifierNumber(identifierNumber);
    res.status(200).json(sensor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getSensorsBySerialNumber/:serialNumber', async (req, res) => {
  try {
    const serialNumber = req.params.serialNumber;
    const sensor = await SensorService.getSensorBySerialNumber(serialNumber);
    res.status(200).json(sensor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/checkDuplicateSerialNumber', async (req, res) => {
  try {
    const { serialNumber, sensorId } = req.query;
    if (!serialNumber) {
      return res.status(400).json({ error: 'Serial number is required' });
    }
    const isDuplicate = await SensorService.isSerialNumberDuplicate(serialNumber as string, sensorId as string);
    res.status(200).json({ isDuplicate });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/addSensorToHub/:id', async (req, res) => {
  try {
    const updatedSensor = await SensorService.addSensorToHub(req.params.id, req.body);
    res.status(200).json(updatedSensor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
