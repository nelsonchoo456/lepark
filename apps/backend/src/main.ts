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
import occurrenceRouter from './routers/occurrenceRouter';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors());
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
app.use('/api/occurrences', occurrenceRouter);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
