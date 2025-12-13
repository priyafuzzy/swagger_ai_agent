import { Router } from 'express';
import mcpController from '../controllers/mcp.controller';
import { validateMcpExecute } from '../validators/mcp.validator';

const router = Router();

// POST /api/mcp/execute -> execute a tool on the MCP compatibility client
router.post('/execute', validateMcpExecute, mcpController.executeToolHandler);

export default router;
