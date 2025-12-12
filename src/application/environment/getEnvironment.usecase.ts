import EnvironmentRepository from '../../domain/repositories/EnvironmentRepository';
import { EnvironmentConfig } from '../../domain/models/EnvironmentConfig';

export async function getEnvironmentUsecase(repo: EnvironmentRepository, envId: string): Promise<EnvironmentConfig | null> {
  if (!envId) throw new Error('envId is required');
  const env = await repo.getById(envId);
  return env;
}

export default getEnvironmentUsecase;
