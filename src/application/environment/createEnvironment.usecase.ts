import { EnvironmentConfig } from '../../domain/models/EnvironmentConfig';
import EnvironmentRepository from '../../domain/repositories/EnvironmentRepository';

export type CreateEnvironmentInput = {
  specId: string;
  name: string;
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  auth?: any;
};

export async function createEnvironmentUsecase(repo: EnvironmentRepository, input: CreateEnvironmentInput): Promise<EnvironmentConfig> {
  // pure application logic (no HTTP, no express) — validate and build entity
  if (!input || !input.specId || !input.name || !input.baseUrl) {
    throw new Error('specId, name and baseUrl are required');
  }

  const id = `env-${Date.now().toString(36)}`;
  const env: EnvironmentConfig = {
    id,
    specId: input.specId,
    name: input.name,
    baseUrl: input.baseUrl,
    defaultHeaders: input.defaultHeaders || {},
    auth: input.auth || null,
    active: true,
  } as EnvironmentConfig;

  await repo.save(env as any);
  return env;
}

export default createEnvironmentUsecase;
