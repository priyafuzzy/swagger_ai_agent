export function validateCreateEnvironmentPayload(payload: any): string[] {
  const errors: string[] = [];
  if (!payload) {
    errors.push('body is required');
    return errors;
  }
  if (!payload.specId || typeof payload.specId !== 'string') errors.push('specId is required and must be a string');
  if (!payload.name || typeof payload.name !== 'string') errors.push('name is required and must be a string');
  if (!payload.baseUrl || typeof payload.baseUrl !== 'string') errors.push('baseUrl is required and must be a string');
  // optional: basic URL pattern
  return errors;
}

export function validateSpecIdParam(specId: any): string | null {
  if (!specId || typeof specId !== 'string') return 'specId is required in the path and must be a string';
  return null;
}

export function validateEnvIdParam(envId: any): string | null {
  if (!envId || typeof envId !== 'string') return 'envId is required in the path and must be a string';
  return null;
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

export default { validateCreateEnvironmentPayload, validateSpecIdParam };
