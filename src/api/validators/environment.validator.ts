import { Request, Response, NextFunction } from 'express';

export function validateCreateEnvironment(req: Request, res: Response, next: NextFunction) {
  const { specId, name, baseUrl, defaultHeaders, authConfig } = req.body || {};
  if (!specId || typeof specId !== 'string') return res.status(400).json({ error: 'specId is required and must be a string' });
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name is required and must be a string' });
  if (!baseUrl || typeof baseUrl !== 'string') return res.status(400).json({ error: 'baseUrl is required and must be a string' });
  if (defaultHeaders !== undefined && typeof defaultHeaders !== 'object') return res.status(400).json({ error: 'defaultHeaders must be an object' });
  if (authConfig !== undefined && typeof authConfig !== 'object') return res.status(400).json({ error: 'authConfig must be an object' });
  next();
}

export function validateEnvIdParamMiddleware(req: Request, res: Response, next: NextFunction) {
  const { envId } = req.params || {};
  if (!envId || typeof envId !== 'string') return res.status(400).json({ error: 'envId param is required' });
  next();
}

// Utility validators (pure functions) used by unit tests or programmatic validation
export function validateCreateEnvironmentPayload(payload: any): string[] {
  const errors: string[] = [];
  if (!payload) {
    errors.push('body is required');
    return errors;
  }
  if (!payload.specId || typeof payload.specId !== 'string') errors.push('specId is required and must be a string');
  if (!payload.name || typeof payload.name !== 'string') errors.push('name is required and must be a string');
  if (!payload.baseUrl || typeof payload.baseUrl !== 'string') errors.push('baseUrl is required and must be a string');
  return errors;
}

export function validateUpdateEnvironmentPayload(payload: any): string[] {
  const errors: string[] = [];
  if (!payload || typeof payload !== 'object') {
    errors.push('body is required');
    return errors;
  }
  if (payload.name !== undefined && typeof payload.name !== 'string') errors.push('name must be a string');
  if (payload.baseUrl !== undefined && typeof payload.baseUrl !== 'string') errors.push('baseUrl must be a string');
  if (payload.defaultHeaders !== undefined && typeof payload.defaultHeaders !== 'object') errors.push('defaultHeaders must be an object');
  if (payload.active !== undefined && typeof payload.active !== 'boolean') errors.push('active must be boolean');
  return errors;
}

// Pure helpers for controllers/tests that validate simple values and return error messages
export function validateSpecIdParam(specId: any): string | null {
  if (!specId || typeof specId !== 'string') return 'specId is required in the path and must be a string';
  return null;
}

export function validateEnvIdParam(envId: any): string | null {
  if (!envId || typeof envId !== 'string') return 'envId is required in the path and must be a string';
  return null;
}

export default { validateCreateEnvironment, validateEnvIdParam, validateCreateEnvironmentPayload, validateUpdateEnvironmentPayload };
