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
import hubRouter from './routers/hubRouter';
import parkAssetRouter from './routers/parkAssetRouter';
import facilityRouter from './routers/facilityRouter';

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
app.use('/api/activitylogs', activityLogRouter);
app.use('/api/statuslogs', statusLogRouter);
app.use('/api/hubs', hubRouter);
app.use('/api/parkassets', parkAssetRouter);
app.use('/api/facility', facilityRouter);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
