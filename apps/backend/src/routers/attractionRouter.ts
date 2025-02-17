import express from 'express';
import AttractionService from '../services/AttractionService';
import { AttractionSchemaType, AttractionTicketListingSchemaType } from '../schemas/attractionSchema';
import multer from 'multer';
import { authenticateJWTStaff } from '../middleware/authenticateJWT';

const router = express.Router();
const upload = multer();

router.post('/createAttraction', authenticateJWTStaff, async (req, res) => {
  try {
    const attraction = await AttractionService.createAttraction(req.body);
    res.status(201).json(attraction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/checkAttractionNameExists', async (req, res) => {
  try {
    const { parkId, title } = req.query;
    const exists = await AttractionService.checkAttractionNameExists(Number(parkId), String(title));
    res.status(200).json({ exists });
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

router.put('/updateAttractionDetails/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const attractionId = req.params.id;
    const updateData: Partial<AttractionSchemaType> = req.body;
    const updatedAttraction = await AttractionService.updateAttractionDetails(attractionId, updateData);
    res.status(200).json(updatedAttraction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteAttraction/:id', authenticateJWTStaff, async (req, res) => {
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

router.post('/createAttractionTicketListing', async (req, res) => {
  try {
    const ticketListing = await AttractionService.createAttractionTicketListing(req.body);
    res.status(201).json(ticketListing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllAttractionTicketListings', async (req, res) => {
  try {
    const ticketListings = await AttractionService.getAllAttractionTicketListings();
    res.status(200).json(ticketListings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAttractionTicketListingsByAttractionId/:attractionId', async (req, res) => {
  try {
    const attractionId = req.params.attractionId;
    const ticketListings = await AttractionService.getAttractionTicketListingsByAttractionId(attractionId);
    res.status(200).json(ticketListings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAttractionTicketListingById/:id', async (req, res) => {
  try {
    const ticketListingId = req.params.id;
    const ticketListing = await AttractionService.getAttractionTicketListingById(ticketListingId);
    res.status(200).json(ticketListing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateAttractionTicketListingDetails/:id', async (req, res) => {
  try {
    const ticketListingId = req.params.id;
    const updateData: Partial<AttractionTicketListingSchemaType> = req.body;
    const updatedTicketListing = await AttractionService.updateAttractionTicketListingDetails(ticketListingId, updateData);
    res.status(200).json(updatedTicketListing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteAttractionTicketListing/:id', async (req, res) => {
  try {
    const ticketListingId = req.params.id;
    await AttractionService.deleteAttractionTicketListing(ticketListingId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
