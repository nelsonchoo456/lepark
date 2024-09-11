import express from 'express';
import ZoneService from '../services/ZoneService';

const router = express.Router();

router.post('/createZone', async (req, res) => {
  try {
    const park = await ZoneService.createZone(req.body);
    res.status(201).json(park);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllZones', async (_, res) => {
  try {
    const zonesList = await ZoneService.getAllZones();
    res.status(200).json(zonesList);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getZoneById/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const park = await ZoneService.getZoneById(id);
    res.status(200).json(park);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
