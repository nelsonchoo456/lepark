import express from 'express';
import ParkAssetService from '../services/ParkAssetService';
import { ParkAssetSchemaType } from '../schemas/parkAssetSchema';
import multer from 'multer';
import { ParkAssetStatusEnum } from '@prisma/client';

const router = express.Router();
const upload = multer();

router.post('/createParkAsset', async (req, res) => {
  try {
    const parkAsset = await ParkAssetService.createParkAsset(req.body);
    res.status(201).json(parkAsset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllParkAssets/:parkId?', async (req, res) => {
  try {
    const parkId = req.params.parkId ? parseInt(req.params.parkId) : undefined;
    let parkAssetList;

    if (parkId === undefined) {
      parkAssetList = await ParkAssetService.getAllParkAssets();
    } else {
      parkAssetList = await ParkAssetService.getAllParkAssetsByParkId(parkId);
    }

    res.status(200).json(parkAssetList);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewParkAssetDetails/:id', async (req, res) => {
  try {
    const parkAssetId = req.params.id;
    const parkAsset = await ParkAssetService.getParkAssetById(parkAssetId);
    if (!parkAsset) {
      return res.status(404).json({ error: 'Park asset not found' });
    }
    res.status(200).json(parkAsset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateParkAssetDetails/:id', async (req, res) => {
  try {
    const parkAssetId = req.params.id;
    const updateData: Partial<ParkAssetSchemaType> = req.body;

    const updatedParkAsset = await ParkAssetService.updateParkAsset(parkAssetId, updateData);
    res.status(200).json(updatedParkAsset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteParkAsset/:id', async (req, res) => {
  try {
    const parkAssetId = req.params.id;
    await ParkAssetService.deleteParkAsset(parkAssetId);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getParkAssetsNeedingMaintenance', async (req, res) => {
  try {
    const parkAssets = await ParkAssetService.getParkAssetsNeedingMaintenance();
    res.status(200).json(parkAssets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateParkAssetStatus/:id', async (req, res) => {
  try {
    const parkAssetId = req.params.id;
    const { newStatus } = req.body;

    if (!Object.values(ParkAssetStatusEnum).includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedParkAsset = await ParkAssetService.updateParkAssetStatus(parkAssetId, newStatus);
    res.status(200).json(updatedParkAsset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/upload', upload.array('files', 5), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      // Commented out to match occurrence router
      // return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedUrls = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const imageUrl = await ParkAssetService.uploadImageToS3(file.buffer, fileName, file.mimetype);
      uploadedUrls.push(imageUrl);
    }

    res.status(200).json({ uploadedUrls });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
