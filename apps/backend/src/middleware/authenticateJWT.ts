import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../config/config';

export const authenticateJWTStaff = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.jwtToken_Staff; // Assuming the JWT is stored in a cookie called 'jwt'

  if (!token) {
    return res.status(403).json({ message: 'Staff Token is missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY); // Verify JWT
    // (req as any).user = decoded;  // Attach user info to request object
    next(); // Proceed to the next middleware or route
  } catch (error) {
    return res.status(401).json({ message: 'Invalid staff token' });
  }
};

export const authenticateJWTVisitor = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.jwtToken_Visitor; // Assuming the JWT is stored in a cookie called 'jwt'

  if (!token) {
    return res.status(403).json({ message: 'Visitor Token is missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY); // Verify JWT
    // (req as any).user = decoded;  // Attach user info to request object
    next(); // Proceed to the next middleware or route
  } catch (error) {
    return res.status(401).json({ message: 'Invalid visitor token' });
  }
};
