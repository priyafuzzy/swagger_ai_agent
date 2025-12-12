import { specRepository } from '../../infrastructure/persistence';

type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export async function validateSpec(specId: string): Promise<ValidationResult> {
  const spec = await specRepository.getById(specId);
  if (!spec) return { valid: false, errors: [`Spec not found: ${specId}`] };

  const errors: string[] = [];
  if (!spec.raw) errors.push('raw spec missing');
  if (!spec.operations || spec.operations.length === 0) errors.push('no operations found');
  if (!spec.title) errors.push('title missing');

  return { valid: errors.length === 0, errors };
}

export default validateSpec;
