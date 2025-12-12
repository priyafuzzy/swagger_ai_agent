export interface Parameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie' | 'body';
  required?: boolean;
  schema?: any;
  description?: string;
}

export interface ResponseSpec {
  status: number | string;
  description?: string;
  content?: Record<string, any>;
}

export interface SecurityRequirement {
  [name: string]: string[];
}

export interface Operation {
  operationId: string;
  method: string;
  path: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: any;
  responses?: ResponseSpec[];
  security?: SecurityRequirement[];
}

export default Operation;
