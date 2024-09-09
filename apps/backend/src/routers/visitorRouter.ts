import express from 'express';
import VisitorService from '../services/VisitorService';
import { VisitorSchema, LoginSchema, PasswordResetRequestSchema, PasswordResetSchema } from '../schemas/visitorSchema';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../config/config';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const visitorData = VisitorSchema.parse(req.body);
    const visitor = await VisitorService.register(visitorData);
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
    const updateData = VisitorSchema.partial()
      .pick({
        firstName: true,
        lastName: true,
        email: true,
        contactNumber: true,
      })
      .parse(req.body);

    const updatedVisitor = await VisitorService.updateVisitorDetails(visitorId, updateData);
    res.status(200).json(updatedVisitor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const loginData = LoginSchema.parse(req.body);
    const { token, user } = await VisitorService.login(loginData);

    res.cookie('jwtToken_Visitor', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 4 * 60 * 60 * 1000, // 4 hours (needs to be same expiry as the JWT token)
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/logout', (_, res) => {
  res
    .clearCookie('jwtToken_Visitor', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    .status(200)
    .send({ message: 'Logout successful' });
});

router.post('/forgot-password', async (req, res) => {
  try {
    const data = PasswordResetRequestSchema.parse(req.body);
    await VisitorService.requestPasswordReset(data);
    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const data = PasswordResetSchema.parse(req.body);
    await VisitorService.resetPassword(data);
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/check-auth', (req, res) => {
  const token = req.cookies.jwtToken_Visitor;

  if (token) {
    jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        res.status(403).send({ message: 'Invalid token' });
      } else {
        const { id } = decoded;

        try {
          const visitor = await VisitorService.getVisitorById(id);

          if (!visitor) {
            res.status(404).send({ message: 'Visitor not found' });
          } else {
            const { password, ...user } = visitor;
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
