import express from 'express';
import StaffService from '../services/StaffService';
import { Prisma, StaffRoleEnum } from '@prisma/client';

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

router.put('/updateStaffDetails/:id', async (req, res) => {
  try {
    const staffId = req.params.id;
    const { firstName, lastName, email, contactNumber } = req.body;

    const updateData: Prisma.StaffUpdateInput = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (contactNumber) updateData.contactNumber = contactNumber;

    const updatedStaff = await StaffService.updateStaffDetails(
      staffId,
      updateData,
    );
    res.status(200).json(updatedStaff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateStaffRole/:id', async (req, res) => {
  try {
    const staffId = req.params.id;
    const { role, requesterId } = req.body; // Assuming requesterId is passed in the request body

    // Convert role to enum type
    const roleEnum = StaffRoleEnum[role as keyof typeof StaffRoleEnum];

    if (!roleEnum) {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    const updatedStaff = await StaffService.updateStaffRole(
      staffId,
      roleEnum,
      requesterId,
    );
    res.status(200).json(updatedStaff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateStaffIsActive/:id', async (req, res) => {
  try {
    const staffId = req.params.id;
    const { isActive, requesterId } = req.body; // Assuming requesterId is passed in the request body

    const updatedStaff = await StaffService.updateStaffIsActive(
      staffId,
      isActive,
      requesterId,
    );
    res.status(200).json(updatedStaff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
