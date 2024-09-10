import express from 'express';
import SpeciesService from '../services/SpeciesService';
import { SpeciesSchema, SpeciesSchemaType } from '../schemas/speciesSchema';

const router = express.Router();

router.post('/createSpecies', async (req, res) => {
  try {
    const speciesData = SpeciesSchema.parse(req.body);
    const species = await SpeciesService.createSpecies(speciesData);
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

router.put('/updateSpeciesDetails/:id', async (req, res) => {
  try {
    const speciesId = req.params.id;
    const updateData: Partial<SpeciesSchemaType> = req.body;

    const updatedSpecies = await SpeciesService.updateSpeciesDetails(speciesId, updateData);
    res.status(200).json(updatedSpecies);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteSpecies/:id', async (req, res) => {
  try {
    const speciesId = req.params.id;

    await SpeciesService.deleteSpecies(speciesId);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
