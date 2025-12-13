import { Request, Response, NextFunction } from 'express';
import { getCompatibilityClient } from '../../infrastructure/mcp/FactoryAdapter';
import logger from '../../infrastructure/logging/Logger';
import mcpConfig from '../../config/mcp';

const ALLOWED_TOOLS = new Set(mcpConfig.allowedTools || []);

function isAllowed(toolName: string) {
  if (!toolName) return false;
  // allow wildcard prefix 'swagger.' matching
  if (ALLOWED_TOOLS.has(toolName)) return true;
  for (const t of ALLOWED_TOOLS) {
    if (t.endsWith('*') && toolName.startsWith(t.replace(/\*$/, ''))) return true;
  }
  return false;
}

export async function fetchSpecHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { url, clientId } = req.body || {};
    if (!url) return res.status(400).json({ error: 'url is required' });
    const toolName = 'swagger.fetch';
    if (!isAllowed(toolName)) return res.status(403).json({ error: `Tool not allowed: ${toolName}` });
    const client = getCompatibilityClient(clientId || 'generator');
    await client.connect();
    const result = await client.executeTool(toolName, { url });
    res.json({ success: true, result });
  } catch (err) {
    logger.error('[mcp.swagger.fetch] ' + String(err));
    next(err);
  }
}

export async function parseSpecHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { content, clientId } = req.body || {};
    if (!content) return res.status(400).json({ error: 'content is required' });
    const toolName = 'swagger.parse';
    if (!isAllowed(toolName)) return res.status(403).json({ error: `Tool not allowed: ${toolName}` });
    const client = getCompatibilityClient(clientId || 'generator');
    await client.connect();
    const result = await client.executeTool(toolName, { content });
    res.json({ success: true, result });
  } catch (err) {
    logger.error('[mcp.swagger.parse] ' + String(err));
    next(err);
  }
}

export async function listOperationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { specId, clientId } = req.body || {};
    if (!specId) return res.status(400).json({ error: 'specId is required' });
    const toolName = 'swagger.listOperations';
    if (!isAllowed(toolName)) return res.status(403).json({ error: `Tool not allowed: ${toolName}` });
    const client = getCompatibilityClient(clientId || 'generator');
    await client.connect();
    const result = await client.executeTool(toolName, { specId });
    res.json({ success: true, result });
  } catch (err) {
    logger.error('[mcp.swagger.listOperations] ' + String(err));
    next(err);
  }
}

export default { fetchSpecHandler, parseSpecHandler, listOperationsHandler };
