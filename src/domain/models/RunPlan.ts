import { Operation } from './Operation';

export interface TestCaseDefinition {
  id: string;
  operationId: string;
  name: string;
  description?: string;
  expectedStatus?: number;
  payloadStrategy?: 'example' | 'schema' | 'llm' | 'none';
}

export interface RunPlan {
  runId: string;
  specId: string;
  envName: string;
  operations: Operation[];
  testCases: TestCaseDefinition[];
  createdAt: string;
}

export default RunPlan;
