export const testCaseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    operationId: { type: 'string' },
    name: { type: 'string' },
    expectedStatus: { type: 'number' },
    payloadStrategy: { type: 'string', enum: ['example', 'schema', 'llm', 'none'] },
  },
  required: ['operationId', 'name'],
  additionalProperties: false,
};

export const testCasesArraySchema = {
  type: 'array',
  items: testCaseSchema,
};

export default { testCaseSchema, testCasesArraySchema };
