import { Router } from 'express';
import swaggerMcpController from '../controllers/swaggerMcp.controller';

const router = Router();

// POST /api/mcp/swagger/fetch -> fetch a remote spec via MCP tool
router.post('/fetch', swaggerMcpController.fetchSpecHandler);

// POST /api/mcp/swagger/parse -> parse raw spec content via MCP tool
router.post('/parse', swaggerMcpController.parseSpecHandler);

// POST /api/mcp/swagger/operations -> list operations for a spec via MCP tool
router.post('/operations', swaggerMcpController.listOperationsHandler);

export default router;
