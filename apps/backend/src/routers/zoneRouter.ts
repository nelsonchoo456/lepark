import express from 'express';
import multer from 'multer';
import ZoneService from '../services/ZoneService';

const router = express.Router();

const upload = multer();

router.post('/createZone', async (req, res) => {
  try {
    const zone = await ZoneService.createZone(req.body);
    res.status(201).json(zone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// router.get('/getAllZones', async (_, res) => {
//   try {
//     const zonesList = await ZoneService.getAllZones();
//     res.status(200).json(zonesList);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

router.get('/getAllZones', async (req, res) => {
  // http://localhost:3333/api/zones/getAllZones
  // http://localhost:3333/api/zones/getAllZones?parkId=<enter_oarkId_here>
  try {
    const parkId = req.query.parkId ? parseInt(req.query.parkId as string) : null;

    if (parkId) {
      const zones = await ZoneService.getZonesByParkId(parkId);
      res.status(200).json(zones);
    } else {
      const zonesList = await ZoneService.getAllZones();
      res.status(200).json(zonesList);
    }

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getZoneById/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const zone = await ZoneService.getZoneById(id);
    res.status(200).json(zone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteZone/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await ZoneService.deleteZoneById(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getZonesByParkId/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const zones = await ZoneService.getZonesByParkId(id);
    res.status(200).json(zones);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateZone/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const zone = await ZoneService.updateZone(id, req.body);
    res.status(200).json(zone);
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

    const uploadedUrls = await Promise.all(files.map(file => 
      ZoneService.uploadImageToS3(file.buffer, `${Date.now()}-${file.originalname}`, file.mimetype)
    ));

    res.status(200).json({ uploadedUrls });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
