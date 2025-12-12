import express from 'express';
import { json } from 'body-parser';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';
import specRoutes from '../../src/api/routes/spec.routes';
import environmentRoutes from '../../src/api/routes/environment.routes';

const app = express();

app.use(json());
app.use(requestLogger);

// Healthcheck
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Mount spec API (stubbed for now)
app.use('/api/spec', specRoutes);
// Mount environment API
app.use('/api/environment', environmentRoutes);

app.use(errorHandler);

export default app;
