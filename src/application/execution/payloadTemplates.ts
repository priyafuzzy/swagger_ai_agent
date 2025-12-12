import { Operation } from '../../domain/models/Operation';

// Simple payload template helpers used by the test generator.
// These are purposely small, deterministic, and easy to extend later.

export function examplePayloadForOperation(op: Operation): any {
  // If requestBody has an example, prefer it
  try {
    const rb = (op as any).requestBody;
    if (rb && rb.content) {
      const first: any = Object.values(rb.content)[0];
      if (first && (first.example || first.examples)) return first.example || first.examples;
      if (first && first.schema && first.schema.properties) {
        const props: any = {};
        for (const [k, v] of Object.entries(first.schema.properties)) {
          (props as any)[k] = exampleValueForSchema(v as any);
        }
        return props;
      }
    }
  } catch (e) {
    // ignore and return null
  }
  return null;
}

export function exampleValueForSchema(schema: any): any {
  if (!schema) return null;
  if (schema.example !== undefined) return schema.example;
  if (schema.type === 'string') return 'string_example';
  if (schema.type === 'integer' || schema.type === 'number') return 1;
  if (schema.type === 'boolean') return false;
  if (schema.type === 'array') return [];
  if (schema.type === 'object') return {};
  return null;
}

export default { examplePayloadForOperation, exampleValueForSchema };
