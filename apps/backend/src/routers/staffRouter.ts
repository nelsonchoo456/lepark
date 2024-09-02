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
    const staffs = await StaffService.getAllStaffs();
    res.status(200).json(staffs);
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
    const updateData: Prisma.StaffUpdateInput = req.body;

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

router.post('/login', async (req, res) => {
  try {
    const { token, user } = await StaffService.login(req.body);

    res.cookie('jwtToken_Staff', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // secure in production
      sameSite: 'strict',
      maxAge: 4 * 60 * 60 * 1000, // 4 hours (needs to be same expiry as the JWT token)
    });

    res.status(200).json(user); // send user data in the response body
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/logout', (_, res) => {
  res
    .clearCookie('jwtToken_Staff', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // secure in production
      sameSite: 'strict',
    })
    .status(200)
    .send({ message: 'Logout successful' });
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    await StaffService.requestPasswordReset(email);
    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await StaffService.resetPassword(token, newPassword);
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
