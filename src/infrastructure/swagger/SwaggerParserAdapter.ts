// Lightweight adapter placeholder for swagger/openapi parsing
// Future: replace with `swagger-parser` or `@apidevtools/swagger-parser` usage

export async function parseSwagger(raw: any): Promise<any> {
  // For now assume the input is already parsed JSON/YAML object
  return raw;
}

export default { parseSwagger };
