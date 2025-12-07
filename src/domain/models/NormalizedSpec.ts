import { Operation } from './Operation';

export interface NormalizedSpec {
  id: string;
  title: string;
  version?: string;
  servers?: string[];
  tags?: string[];
  operationCount?: number;
  operations: Operation[];
  // raw holds original parsed spec if needed for future use
  raw?: any;
}

export default NormalizedSpec;
