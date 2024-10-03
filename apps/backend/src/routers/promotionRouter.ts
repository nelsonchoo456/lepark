import express from 'express';
import { EventSchemaType } from '../schemas/eventSchema';
import multer from 'multer';
import { authenticateJWTStaff } from '../middleware/authenticateJWT';
import PromotionService from '../services/PromotionService';

const router = express.Router();
const upload = multer();

router.post('/createPromotion', authenticateJWTStaff, async (req, res) => {
  try {
    const promotion = await PromotionService.createPromotion(req.body);
    res.status(201).json(promotion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllPromotions', async (req, res) => {
  try {
    const parkId = req.query.parkId ? req.query.parkId as string : null;
    const eventId = req.query.eventId ? req.query.eventId as string : null;
    const attractionId = req.query.attractionId ? req.query.attractionId as string : null;

    if (parkId) {
      const zones = await PromotionService.getPromotionsByParkId(parkId);
      res.status(200).json(zones);
    } else if (eventId) {
      const promotions = await PromotionService.getPromotionsByEventId(eventId, parseInt(parkId));
      res.status(200).json(promotions);
    } else if (attractionId) {
      const promotions = await PromotionService.getPromotionsByAttractionId(attractionId, parseInt(parkId));
      res.status(200).json(promotions);
    } else {
      const promotions = await PromotionService.getAllPromotions();
      res.status(200).json(promotions);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getPromotionById/:promotionId', async (req, res) => {
  try {
    const id = req.params.promotionId;
    const events = await PromotionService.getPromotionById(id);
    res.status(200).json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updatePromotion/:promotionId', authenticateJWTStaff, async (req, res) => {
  try {
    const promotionId = req.params.promotionId;
    const updatedEvent = await PromotionService.updatePromotionDetails(promotionId, req.body);
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deletePromotion/:promotionId', authenticateJWTStaff, async (req, res) => {
  try {
    const promotionId = req.params.promotionId;
    await PromotionService.deletePromotion(promotionId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// router.post('/upload', upload.array('files', 5), async (req, res) => {
//   try {
//     const files = req.files as Express.Multer.File[];

//     if (!files || files.length === 0) {
//       // return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const uploadedUrls = [];
//     for (const file of files) {
//       const fileName = `${Date.now()}-${file.originalname}`;
//       const imageUrl = await EventService.uploadImageToS3(file.buffer, fileName, file.mimetype);
//       uploadedUrls.push(imageUrl);
//     }

//     res.status(200).json({ uploadedUrls });
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     res.status(500).json({ error: 'Failed to upload image' });
//   }
// });

export default router;
