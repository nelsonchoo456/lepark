import express from 'express';
import HubService, { HubNotActiveError, HubNotFoundError } from '../services/HubService';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.post('/createHub', async (req, res) => {
  try {
    console.log('HELLO!');
    const hub = await HubService.createHub(req.body);
    console.log('SUCCESSFULLY CREATED HUB!');
    res.status(201).json(hub);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllHubs', async (req, res) => {
  try {
    const parkId = req.query.parkId ? parseInt(req.query.parkId as string) : null;
    if (!parkId) {
      const hubs = await HubService.getAllHubs();
      res.status(200).json(hubs);
    } else {
      //console.log('Getting hubs by parkId:', parkId);
      const hubs = await HubService.getHubsByParkId(parkId);
      res.status(200).json(hubs);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getHubById/:id', async (req, res) => {
  try {
    const hub = await HubService.getHubById(req.params.id);
    if (hub) {
      res.status(200).json(hub);
    } else {
      res.status(404).json({ error: 'Hub not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getHubByIdentifierNumber/:identifierNumber', async (req, res) => {
  try {
    const hub = await HubService.getHubByIdentifierNumber(req.params.identifierNumber);
    if (hub) {
      res.status(200).json(hub);
    } else {
      res.status(404).json({ error: 'Hub not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getHubByRadioGroup/:radioGroup', async (req, res) => {
  try {
    const hub = await HubService.getHubByRadioGroup(parseInt(req.params.radioGroup));
    if (hub) {
      res.status(200).json(hub);
    } else {
      res.status(404).json({ error: 'Hub not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateHubDetails/:id', async (req, res) => {
  try {
    const hub = await HubService.updateHubDetails(req.params.id, req.body);
    res.status(200).json(hub);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteHub/:id', async (req, res) => {
  try {
    await HubService.deleteHub(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/upload', upload.array('files', 5), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedUrls = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const imageUrl = await HubService.uploadImageToS3(file.buffer, fileName, file.mimetype);
      uploadedUrls.push(imageUrl);
    }

    res.status(200).json({ uploadedUrls });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.get('/checkDuplicateSerialNumber', async (req, res) => {
  try {
    const { serialNumber, hubId } = req.query;
    if (!serialNumber) {
      return res.status(400).json({ error: 'Serial number is required' });
    }
    const isDuplicate = await HubService.isSerialNumberDuplicate(serialNumber as string, hubId as string);
    res.status(200).json({ isDuplicate });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/addHubToZone/:id', async (req, res) => {
  try {
    const updatedHub = await HubService.addHubToZone(req.params.id, req.body);
    res.status(200).json(updatedHub);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/verifyHubInitialization', async (req, res) => {
  try {
    const { identifierNumber } = req.body;
    console.log('req.socket.remoteAddress', req.socket.remoteAddress);
    let ipAddress = req.socket.remoteAddress || '127.0.0.1';
    ipAddress = ipAddress == '::1' ? '127.0.0.1' : ipAddress.split(':')[3];
    const token = await HubService.verifyHubInitialization(identifierNumber, ipAddress);
    res.status(200).json({ token });
  } catch (error) {
    if (error instanceof HubNotFoundError) {
      res.status(404).json({ error: error.message });
    } else if (error instanceof HubNotActiveError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

router.post('/pushSensorReadings', async (req, res) => {
  try {
    const { hubId, jsonPayloadString, sha256, ipAddress } = req.body;
    const result = await HubService.pushSensorReadings(hubId, jsonPayloadString, sha256, ipAddress);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
