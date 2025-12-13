import { Request, Response, NextFunction } from 'express';
import { getCompatibilityClient } from '../../infrastructure/mcp/FactoryAdapter';
import logger from '../../infrastructure/logging/Logger';
import mcpConfig from '../../config/mcp';

const ALLOWED_TOOLS = new Set(mcpConfig.allowedTools || []);

export async function executeToolHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { toolName, params, clientId } = req.body;
    if (!toolName) return res.status(400).json({ error: 'toolName is required' });
    if (!ALLOWED_TOOLS.has(toolName)) {
      logger.warn(`[mcp.execute] Attempt to invoke disallowed tool: ${toolName}`);
      return res.status(403).json({ error: `Tool not allowed: ${toolName}` });
    }
    const client = getCompatibilityClient(clientId || 'generator');
    logger.info(`[mcp.execute] Executing tool ${toolName} via client ${clientId || 'generator'}`);
    await client.connect();
    const result = await client.executeTool(toolName, params || {});
    logger.info(`[mcp.execute] Tool ${toolName} completed`);
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
}

export default { executeToolHandler };
