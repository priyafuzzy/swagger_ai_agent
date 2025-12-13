import express from 'express';
import { json } from 'body-parser';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';
import specRoutes from '../../src/api/routes/spec.routes';
import environmentRoutes from '../../src/api/routes/environment.routes';
import executionRoutes from '../../src/api/routes/execution.routes';
import testgenRoutes from '../../src/api/routes/testgen.routes';
import mcpRoutes from '../../src/api/routes/mcp.routes';
import mcpSwaggerRoutes from '../../src/api/routes/mcp.swagger.routes';

const app = express();

app.use(json());
app.use(requestLogger);

// Healthcheck
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Mount spec API (stubbed for now)
app.use('/api/spec', specRoutes);
// Mount environment API
app.use('/api/environment', environmentRoutes);
// Mount execution API
app.use('/api/execution', executionRoutes);
// Mount testgen API
app.use('/api/testgen', testgenRoutes);
// Mount MCP API
app.use('/api/mcp', mcpRoutes);
// Mount MCP Swagger helpers
app.use('/api/mcp/swagger', mcpSwaggerRoutes);

app.use(errorHandler);

export default app;
