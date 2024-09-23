/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import cors from 'cors';
import staffRouter from './routers/staffRouter';
import visitorRouter from './routers/visitorRouter';
import speciesRouter from './routers/speciesRouter';
import parkRouter from './routers/parkRouter';
import zoneRouter from './routers/zoneRouter';
import occurrenceRouter from './routers/occurrenceRouter';
import activityLogRouter from './routers/activityLogRouter';
import statusLogRouter from './routers/statusLogRouter';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import attractionRouter from './routers/attractionRouter';
import hubRouter from './routers/hubRouter';
import facilityRouter from './routers/facilityRouter';
import eventRouter from './routers/eventRouter';
import plantTaskRouter from './routers/plantTaskRouter';
import { authenticateJWTStaff } from './middleware/authenticateJWT';

dotenv.config();
const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // You could add a list of allowed origins and check against that too
      if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
        return callback(null, true);
      }

      // To allow specific domains, add them above this line as additional checks

      // If the origin doesn't match any criteria, reject it
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to backend!' });
});

// Routes
app.use('/api/staffs', staffRouter);
app.use('/api/species', speciesRouter);
app.use('/api/visitors', visitorRouter);
app.use('/api/parks', parkRouter);
app.use('/api/zones', zoneRouter);
app.use('/api/occurrences', occurrenceRouter);
app.use('/api/activitylogs', authenticateJWTStaff, activityLogRouter);
app.use('/api/statuslogs', authenticateJWTStaff, statusLogRouter);
app.use('/api/attractions', attractionRouter);
app.use('/api/hubs', hubRouter);
app.use('/api/facilities', facilityRouter);
app.use('/api/events', eventRouter);
app.use('/api/planttasks', plantTaskRouter);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
