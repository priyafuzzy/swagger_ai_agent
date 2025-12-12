export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'apiKey' | 'oauth2';
  credentials?: Record<string, any>;
}

export interface EnvironmentConfig {
  id: string;
  specId: string;
  name: string;
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  auth?: AuthConfig;
  active?: boolean;
}

export default EnvironmentConfig;
