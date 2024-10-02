import express from 'express';
import SpeciesService from '../services/SpeciesService';
import { SpeciesSchema, SpeciesSchemaType } from '../schemas/speciesSchema';
import multer from 'multer';
import { authenticateJWTStaff } from '../middleware/authenticateJWT';

const router = express.Router();
const upload = multer();

router.post('/createSpecies', authenticateJWTStaff, async (req, res) => {
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

router.get('/getSpeciesNameById/:id', async (req, res) => {
  try {
    const speciesId = req.params.id;
    const speciesName = await SpeciesService.getSpeciesNameById(speciesId);
    res.status(200).json({ speciesName });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateSpeciesDetails/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const speciesId = req.params.id;
    const updateData: Partial<SpeciesSchemaType> = req.body;

    const updatedSpecies = await SpeciesService.updateSpeciesDetails(speciesId, updateData);
    res.status(200).json(updatedSpecies);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteSpecies/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const speciesId = req.params.id;

    await SpeciesService.deleteSpecies(speciesId);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getOccurrencesBySpeciesId/:id', async (req, res) => {
  try {
    const speciesId = req.params.id;
    const occurrences = await SpeciesService.getOccurrencesBySpeciesId(speciesId);
    res.status(200).json(occurrences);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getOccurrencesBySpeciesIdByParkId/:speciesId/:parkId', async (req, res) => {
  try {
    const speciesId = req.params.speciesId;
    const parkId = req.params.parkId;
    const occurrences = await SpeciesService.getOccurrencesBySpeciesIdByParkId(speciesId, parkId);
    res.status(200).json(occurrences);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/upload', upload.array('files', 5), async (req, res) => {
  try {
    // Use a type assertion to tell TypeScript that req.file exists
    const files = req.files as Express.Multer.File[];

    // Check if a file is provided
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedUrls = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`; // Create a unique file name
      const imageUrl = await SpeciesService.uploadImageToS3(file.buffer, fileName, file.mimetype);
      uploadedUrls.push(imageUrl);
    }

    // Return the image URL
    res.status(200).json({ uploadedUrls });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
