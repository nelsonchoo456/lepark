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
    const occurrenceList = await ParkService.getAllParks();
    res.status(200).json(occurrenceList);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



export default router;
