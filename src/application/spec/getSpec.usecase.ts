import { specRepository } from '../../infrastructure/persistence';
import { NormalizedSpec } from '../../domain/models/NormalizedSpec';

export async function getSpecById(specId: string): Promise<NormalizedSpec> {
  const spec = await specRepository.getById(specId);
  if (!spec) throw new Error(`Spec not found: ${specId}`);
  return spec;
}

export default getSpecById;
