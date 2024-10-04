import express from 'express';
import { AnnouncementSchemaType } from '../schemas/announcementSchema';
import { authenticateJWTStaff } from '../middleware/authenticateJWT';
import AnnouncementService from '../services/AnnouncementService';

const router = express.Router();

router.post('/createAnnouncement', authenticateJWTStaff, async (req, res) => {

  try {
    const announcement = await AnnouncementService.createAnnouncement(req.body);
    res.status(201).json(announcement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllAnnouncements', async (req, res) => {
  try {
    const announcements = await AnnouncementService.getAllAnnouncements();
    res.status(200).json(announcements);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewAnnouncementDetails/:id', async (req, res) => {
  try {
    const announcementId = req.params.id;
    const announcement = await AnnouncementService.getAnnouncementById(announcementId);
    res.status(200).json(announcement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAnnouncementsByParkId/:parkId', async (req, res) => {
  try {
    const parkId = parseInt(req.params.parkId);
    const announcements = await AnnouncementService.getAnnouncementsByParkId(parkId);
    res.status(200).json(announcements);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateAnnouncementDetails/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const announcementId = req.params.id;
    const updateData: Partial<AnnouncementSchemaType> = req.body;
    const announcement = await AnnouncementService.updateAnnouncementDetails(announcementId, updateData);
    res.status(200).json(announcement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteAnnouncement/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const announcementId = req.params.id;
    await AnnouncementService.deleteAnnouncement(announcementId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
