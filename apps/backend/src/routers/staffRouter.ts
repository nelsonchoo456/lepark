import express from 'express';
import StaffService from '../services/StaffService';
import { Prisma } from '@prisma/client';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const staff = await StaffService.register(req.body);
    res.status(201).json(staff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllStaffs', async (_, res) => {
  try {
    const admins = await StaffService.getAllStaffs();
    res.status(200).json(admins);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewStaffDetails/:id', async (req, res) => {
  try {
    const staffId = req.params.id;
    const staff = await StaffService.getStaffById(staffId);
    res.status(200).json(staff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
