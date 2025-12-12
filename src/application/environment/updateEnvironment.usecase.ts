import EnvironmentRepository from '../../domain/repositories/EnvironmentRepository';
import { EnvironmentConfig } from '../../domain/models/EnvironmentConfig';

export type UpdateEnvironmentInput = Partial<Pick<EnvironmentConfig, 'name' | 'baseUrl' | 'defaultHeaders' | 'auth' | 'active'>>;

export async function updateEnvironmentUsecase(repo: EnvironmentRepository, envId: string, input: UpdateEnvironmentInput): Promise<EnvironmentConfig> {
  if (!envId) throw new Error('envId is required');
  const existing = await repo.getById(envId);
  if (!existing) throw new Error('environment not found');

  const updated: EnvironmentConfig = {
    ...existing,
    name: input.name ?? existing.name,
    baseUrl: input.baseUrl ?? existing.baseUrl,
    defaultHeaders: input.defaultHeaders ?? existing.defaultHeaders,
    auth: input.auth ?? existing.auth,
    active: typeof input.active === 'boolean' ? input.active : existing.active,
  } as EnvironmentConfig;

  await repo.save(updated as any);
  return updated;
}

export default updateEnvironmentUsecase;
