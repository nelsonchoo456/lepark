import express from 'express';
import AttractionService from '../services/AttractionService';
import { AttractionSchemaType } from '../schemas/attractionSchema';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.post('/createAttraction', async (req, res) => {
  try {
    const attraction = await AttractionService.createAttraction(req.body);
    res.status(201).json(attraction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllAttractions', async (req, res) => {
  try {
    const attractions = await AttractionService.getAllAttractions();
    res.status(200).json(attractions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAttractionsByParkId/:parkId', async (req, res) => {
  try {
    const parkId = parseInt(req.params.parkId);
    const attractions = await AttractionService.getAttractionsByParkId(parkId);
    res.status(200).json(attractions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewAttractionDetails/:id', async (req, res) => {
  try {
    const attractionId = req.params.id;
    const attraction = await AttractionService.getAttractionById(attractionId);
    res.status(200).json(attraction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateAttractionDetails/:id', async (req, res) => {
  try {
    const attractionId = req.params.id;
    const updateData: Partial<AttractionSchemaType> = req.body;
    const updatedAttraction = await AttractionService.updateAttractionDetails(attractionId, updateData);
    res.status(200).json(updatedAttraction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteAttraction/:id', async (req, res) => {
  try {
    const attractionId = req.params.id;
    await AttractionService.deleteAttraction(attractionId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/upload', upload.array('files', 5), async (req, res) => {
  try {
     const files = req.files as Express.Multer.File[];

     // Check if a file is provided
     if (!files || files.length === 0) {
       // return res.status(400).json({ error: 'No file uploaded' });
     }

    const uploadedUrls = [];
    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const imageUrl = await AttractionService.uploadImageToS3(file.buffer, fileName, file.mimetype);
      uploadedUrls.push(imageUrl);
    }

    res.status(200).json({ uploadedUrls });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;