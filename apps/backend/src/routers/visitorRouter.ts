import express from 'express';
import VisitorService from '../services/VisitorService';
import { Prisma, StaffRoleEnum } from '@prisma/client';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const visitor = await VisitorService.register(req.body);
    res.status(201).json(visitor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllVisitors', async (_, res) => {
  try {
    const visitors = await VisitorService.getAllVisitors();
    res.status(200).json(visitors);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewVisitorDetails/:id', async (req, res) => {
  try {
    const visitorId = req.params.id;
    const visitor = await VisitorService.getVisitorById(visitorId);
    res.status(200).json(visitor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateVisitorDetails/:id', async (req, res) => {
  try {
    const visitorId = req.params.id;
    const updateData: Prisma.VisitorUpdateInput = req.body;

    const updatedVisitor = await VisitorService.updateVisitorDetails(
      visitorId,
      updateData,
    );
    res.status(200).json(updatedVisitor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { token, user } = await VisitorService.login(req.body);

    res.cookie('jwtToken_Visitor', token, {
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
    .clearCookie('jwtToken_Visitor', {
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
    await VisitorService.requestPasswordReset(email);
    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await VisitorService.resetPassword(token, newPassword);
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/addFavoriteSpecies', async (req, res) => {
  try {
    const { visitorId, speciesId } = req.body;

    const updatedVisitor = await VisitorService.addFavoriteSpecies(visitorId, speciesId);
    res.status(200).json(updatedVisitor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
