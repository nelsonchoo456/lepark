import express from 'express';
import ParkService from '../services/ParkService';

const router = express.Router();

router.post('/createPark', async (req, res) => {
  try {
    const park = await ParkService.createPark(req.body);
    res.status(201).json(park);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllParks', async (_, res) => {
  try {
    const parksList = await ParkService.getAllParks();
    res.status(200).json(parksList);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getParkById/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const park = await ParkService.getParkById(id);
    res.status(200).json(park);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



export default router;
