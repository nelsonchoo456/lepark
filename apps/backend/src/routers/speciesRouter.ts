import express from 'express';
import SpeciesService from '../services/SpeciesService';
import { Prisma } from '@prisma/client';

const router = express.Router();

router.post('/createSpecies', async (req, res) => {
  try {
    const species = await SpeciesService.createSpecies(req.body);
    res.status(201).json(species);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllSpecies', async (_, res) => {
  try {
    const speciesList = await SpeciesService.getAllSpecies();
    res.status(200).json(speciesList);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewSpeciesDetails/:id', async (req, res) => {
  try {
    const speciesId = req.params.id;
    const species = await SpeciesService.getSpeciesById(speciesId);
    res.status(200).json(species);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
