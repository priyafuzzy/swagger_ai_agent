import { Request, Response, NextFunction } from 'express';

export function validateBuildPayload(req: Request, res: Response, next: NextFunction) {
  const body = req.body || {};
  const { specId, operationId, mode, hints, clientName } = body;

  if (!specId || typeof specId !== 'string') {
    return res.status(400).json({ error: 'specId is required and must be a string' });
  }

  if (!operationId || typeof operationId !== 'string') {
    return res.status(400).json({ error: 'operationId is required and must be a string' });
  }

  if (mode && !['schema-only', 'schema-with-llm', 'prefer-example'].includes(mode)) {
    return res.status(400).json({ error: 'mode must be one of schema-only|schema-with-llm|prefer-example' });
  }

  if (hints && typeof hints !== 'object') {
    return res.status(400).json({ error: 'hints must be an object' });
  }

  if (clientName && typeof clientName !== 'string') {
    return res.status(400).json({ error: 'clientName must be a string' });
  }

  next();
}

export default { validateBuildPayload };
