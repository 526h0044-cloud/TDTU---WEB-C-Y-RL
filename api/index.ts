import express from 'express';
import { apiRouter } from '../server/api.ts';

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use('/api', apiRouter);

export default app;
