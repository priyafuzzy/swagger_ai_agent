import EnvironmentRepository from '../../domain/repositories/EnvironmentRepository';

export async function deleteEnvironmentUsecase(repo: EnvironmentRepository, envId: string): Promise<void> {
  if (!envId) throw new Error('envId is required');
  await repo.delete(envId);
}

export default deleteEnvironmentUsecase;
