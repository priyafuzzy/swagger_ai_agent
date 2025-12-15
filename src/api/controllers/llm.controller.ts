import { Request, Response, NextFunction } from 'express';
import { buildPayloadFromSchemaUsecase } from '../../application/llm/buildPayloadFromSchema.usecase';

export async function buildPayloadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { specId, operationId, mode, hints, clientName } = req.body || {};
    if (!specId || !operationId) return res.status(400).json({ error: 'specId and operationId are required' });

    const payload = await buildPayloadFromSchemaUsecase(specId, operationId, { mode, hints, clientName });
    res.json({ specId, operationId, payload });
  } catch (err) {
    next(err);
  }
}

export default { buildPayloadHandler };
