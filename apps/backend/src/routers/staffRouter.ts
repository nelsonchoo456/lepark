import express from 'express';
import StaffService from '../services/StaffService';
import { StaffRoleEnum } from '@prisma/client';
import { StaffSchema, LoginSchema, PasswordResetRequestSchema, PasswordResetSchema } from '../schemas/staffSchema';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../config/config';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const staffData = StaffSchema.parse(req.body);
    const staff = await StaffService.register(staffData);
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
    const updateData = StaffSchema.partial()
      .pick({
        firstName: true,
        lastName: true,
        contactNumber: true,
      })
      .parse(req.body);

    const updatedStaff = await StaffService.updateStaffDetails(staffId, updateData);
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

    const updatedStaff = await StaffService.updateStaffRole(staffId, roleEnum, requesterId);
    res.status(200).json(updatedStaff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateStaffIsActive/:id', async (req, res) => {
  try {
    const staffId = req.params.id;
    const { isActive, requesterId } = req.body; // Assuming requesterId is passed in the request body

    const updatedStaff = await StaffService.updateStaffIsActive(staffId, isActive, requesterId);
    res.status(200).json(updatedStaff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const loginData = LoginSchema.parse(req.body);
    const { token, user } = await StaffService.login(loginData);

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
    const data = PasswordResetRequestSchema.parse(req.body);
    await StaffService.requestPasswordReset(data);
    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const data = PasswordResetSchema.parse(req.body);
    await StaffService.resetPassword(data);
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/check-auth', (req, res) => {
  const token = req.cookies.jwtToken_Staff;

  if (token) {
    jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        res.status(403).send({ message: 'Invalid token' });
      } else {
        const { id } = decoded;

        try {
          const staff = await StaffService.getStaffById(id);

          if (!staff) {
            res.status(404).send({ message: 'Staff not found' });
          } else {
            const { password, ...user } = staff;
            res.status(200).send(user);
          }
        } catch (error) {
          res.status(500).send({ message: 'Internal Server Error' });
        }
      }
    });
  } else {
    res.status(401).send({ message: 'No token provided' });
  }
});

export default router;
