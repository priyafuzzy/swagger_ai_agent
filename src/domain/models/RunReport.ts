export interface TestResult {
  testCaseId: string;
  operationId: string;
  status: 'passed' | 'failed' | 'error';
  httpStatus?: number;
  durationMs?: number;
  request?: any;
  response?: any;
  error?: string;
}

export interface RunReport {
  runId: string;
  specId: string;
  envName: string;
  total: number;
  passed: number;
  failed: number;
  errors: number;
  results: TestResult[];
  startedAt?: string;
  finishedAt?: string;
}

export default RunReport;
