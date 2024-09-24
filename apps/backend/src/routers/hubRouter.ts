import express from 'express';
import HubService from '../services/HubService';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.post('/createHub', async (req, res) => {
  try {
    const hub = await HubService.createHub(req.body);
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

export default router;