import { specRepository } from '../../infrastructure/persistence';
import { Operation } from '../../domain/models/Operation';

export async function listOperationsForSpec(specId: string): Promise<Operation[]> {
  const spec = await specRepository.getById(specId);
  if (!spec) throw new Error(`Spec not found: ${specId}`);
  return spec.operations || [];
}

export default listOperationsForSpec;
