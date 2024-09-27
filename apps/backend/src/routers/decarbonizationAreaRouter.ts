import express from 'express';
import DecarbonizationAreaService from '../services/DecarbonizationAreaService';

const router = express.Router();

router.post('/createDecarbonizationArea', async (req, res) => {
  try {
    console.log('Creating decarbonization area:', req.body);
    const area = await DecarbonizationAreaService.createDecarbonizationArea(req.body);
    res.status(201).json(area);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getDecarbonizationAreaById/:id', async (req, res) => {
  try {
    const area = await DecarbonizationAreaService.getDecarbonizationAreaById(req.params.id);
    res.status(200).json(area);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateDecarbonizationArea/:id', async (req, res) => {
  try {
    const area = await DecarbonizationAreaService.updateDecarbonizationArea(req.params.id, req.body);
    res.status(200).json(area);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteDecarbonizationArea/:id', async (req, res) => {
  try {
    await DecarbonizationAreaService.deleteDecarbonizationArea(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllDecarbonizationAreas', async (req, res) => {
  try {
    const areas = await DecarbonizationAreaService.getAllDecarbonizationAreas();
    res.status(200).json(areas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:parkId', async (req, res) => {
  try {
    const parkId = parseInt(req.params.parkId);
    console.log('Fetching decarbonization areas by park ID:', parkId);
    const decarbonizationAreas = await DecarbonizationAreaService.getDecarbonizationAreasByParkId(parkId);
    res.status(200).json(decarbonizationAreas);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching decarbonization areas by park ID', error });
  }
});

router.get('/:id/occurrences', async (req, res) => {
  try {
    const occurrences = await DecarbonizationAreaService.getOccurrencesWithinDecarbonizationArea(req.params.id);
    res.status(200).json(occurrences);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
