import express from 'express';
import ParkService from '../services/ParkService';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.post('/createPark', async (req, res) => {
  try {
    const park = await ParkService.createPark(req.body);
    res.status(201).json(park);
  } catch (error) {
    if (error.message === 'A park with this name already exists') {
      res.status(409).json({ error: error.message }); // 409 Conflict
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

router.put('/updatePark/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const park = await ParkService.updatePark(id, req.body);
    console.log(park)
    res.status(200).json(park);
  } catch (error) {
    if (error.message === 'A park with this name already exists') {
      res.status(409).json({ error: error.message }); // 409 Conflict
    } else {
      res.status(400).json({ error: error.message });
    }
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

router.get('/getRandomParkImage', async (_, res) => {
  try {
    const images = await ParkService.getRandomParkImage();
    res.status(200).json(images);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deletePark/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await ParkService.deleteParkById(id);
    res.status(204).send();
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
      // return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedUrls = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`; // Create a unique file name
      const imageUrl = await ParkService.uploadImageToS3(file.buffer, fileName, file.mimetype);
      console.log("/upload", imageUrl)
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
