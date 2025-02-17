import express from 'express';
import FacilityService from '../services/FacilityService';
import multer from 'multer';
import { authenticateJWTStaff } from '../middleware/authenticateJWT';

const router = express.Router();
const upload = multer();

router.post('/createFacility', authenticateJWTStaff, async (req, res) => {
  try {
    const facility = await FacilityService.createFacility(req.body);
    res.status(201).json(facility);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllFacilities', async (req, res) => {
  try {
    const parkId = req.query.parkId ? parseInt(req.query.parkId as string) : null;
    if (!parkId) {
      const facilities = await FacilityService.getAllFacilities();
      res.status(200).json(facilities);
    } else {
      const facilities = await FacilityService.getFacilitiesByParkId(parkId);
      res.status(200).json(facilities);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getFacilityById/:id', async (req, res) => {
  try {
    const facility = await FacilityService.getFacilityById(req.params.id);
    res.status(200).json(facility);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateFacilityDetails/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const facility = await FacilityService.updateFacilityDetails(req.params.id, req.body);
    res.status(200).json(facility);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteFacility/:id', authenticateJWTStaff, async (req, res) => {
  try {
    await FacilityService.deleteFacility(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/upload', upload.array('files', 5), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const uploadedUrls = [];
    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const imageUrl = await FacilityService.uploadImageToS3(file.buffer, fileName, file.mimetype);
      uploadedUrls.push(imageUrl);
    }
    res.status(200).json({ uploadedUrls });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.get('/check-existing', async (req, res) => {
  const { name, parkId } = req.query;

  try {
    const exists = await FacilityService.checkExistingFacility(name as string, Number(parkId));
    return res.status(200).json({ exists });
  } catch (error) {
    console.error('Error checking existing facility:', error);
    return res.status(400).json({ message: 'Internal server error' });
  }
});

export default router;
