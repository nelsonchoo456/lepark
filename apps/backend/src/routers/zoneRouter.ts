import express from 'express';
import ZoneService from '../services/ZoneService';

const router = express.Router();

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

router.get('/getZonesByParkId/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const zones = await ZoneService.getZonesByParkId(id);
    res.status(200).json(zones);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
