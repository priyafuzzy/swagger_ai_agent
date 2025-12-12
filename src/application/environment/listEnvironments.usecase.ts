import EnvironmentRepository from '../../domain/repositories/EnvironmentRepository';
import { EnvironmentConfig } from '../../domain/models/EnvironmentConfig';

export async function listEnvironmentsUsecase(repo: EnvironmentRepository, specId: string): Promise<EnvironmentConfig[]> {
  if (!specId) throw new Error('specId is required');
  const list = await repo.listBySpec(specId);
  return list || [];
}

export default listEnvironmentsUsecase;
