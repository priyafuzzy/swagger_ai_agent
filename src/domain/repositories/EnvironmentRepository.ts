import { EnvironmentConfig } from '../models/EnvironmentConfig';

export interface EnvironmentRepository {
  save(env: EnvironmentConfig): Promise<void>;
  getById(id: string): Promise<EnvironmentConfig | null>;
  listBySpec(specId: string): Promise<EnvironmentConfig[]>;
  delete(id: string): Promise<void>;
}

export default EnvironmentRepository;
