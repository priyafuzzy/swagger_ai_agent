import { specRepository } from '../../infrastructure/persistence';

export async function listTagsForSpec(specId: string): Promise<string[]> {
  const spec = await specRepository.getById(specId);
  if (!spec) throw new Error(`Spec not found: ${specId}`);
  // prefer spec.tags if present, otherwise derive from operations
  if (Array.isArray(spec.tags) && spec.tags.length > 0) return spec.tags;
  const tags = new Set<string>();
  (spec.operations || []).forEach((op: any) => {
    if (op.tags && Array.isArray(op.tags)) op.tags.forEach((t: string) => tags.add(t));
  });
  return Array.from(tags);
}

export default listTagsForSpec;
