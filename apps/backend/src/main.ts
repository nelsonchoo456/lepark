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
import parkAssetRouter from './routers/parkAssetRouter';
import facilityRouter from './routers/facilityRouter';
import eventRouter from './routers/eventRouter';
import plantTaskRouter from './routers/plantTaskRouter';
import attractionTicketRouter from './routers/attractionTicketRouter';
import { authenticateJWTStaff } from './middleware/authenticateJWT';
import sensorRouter from './routers/sensorRouter';
import decarbonizationAreaRouter from './routers/decarbonizationAreaRouter';
import sequestrationHistoryRouter from './routers/sequestrationHistoryRouter';
import promotionRouter from './routers/promotionRouter';
import os from 'os';
import sensorReadingRouter from './routers/sensorReadingRouter';
import faqRouter from './routers/faqRouter';
import AnnouncementRouter from './routers/announcementRouter';
import eventTicketRouter from './routers/eventTicketRouter';
import maintenanceTaskRouter from './routers/maintenanceTaskRouter';
import bookingRouter from './routers/bookingRouter';

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

      // To allow Capacitor simulators
      if (origin.startsWith('capacitor')) {
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
app.use('/api/parkassets', authenticateJWTStaff, parkAssetRouter);
app.use('/api/facilities', facilityRouter);
app.use('/api/events', eventRouter);
app.use('/api/decarbonizationarea', decarbonizationAreaRouter);
app.use('/api/sequestrationhistory', sequestrationHistoryRouter);
app.use('/api/planttasks', authenticateJWTStaff, plantTaskRouter);
app.use('/api/sensors', authenticateJWTStaff, sensorRouter);
app.use('/api/attractionTickets', attractionTicketRouter);
app.use('/api/promotions', promotionRouter);
app.use('/api/sensorreadings', sensorReadingRouter);
app.use('/api/faq', faqRouter);
app.use('/api/announcements', AnnouncementRouter);
app.use('/api/eventTickets', eventTicketRouter);
app.use('/api/maintenancetasks', maintenanceTaskRouter);
app.use('/api/bookings', bookingRouter);

const port = process.env.PORT || 3333;
const networkInterfaces = os.networkInterfaces();
const serverIp = Object.values(networkInterfaces)
  .flat()
  .find((iface) => iface?.family === 'IPv4' && !iface.internal)?.address;

console.log(`Server IP address: ${serverIp}`);
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
