import express from 'express';
import SpeciesService from '../services/SpeciesService';
import { Prisma } from '@prisma/client';

const router = express.Router();

router.post('/createSpecies', async (req, res) => {
  try {
    const staff = await SpeciesService.createSpecies(req.body);
    res.status(201).json(staff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllSpecies', async (_, res) => {
  try {
    const admins = await SpeciesService.getAllSpecies();
    res.status(200).json(admins);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
