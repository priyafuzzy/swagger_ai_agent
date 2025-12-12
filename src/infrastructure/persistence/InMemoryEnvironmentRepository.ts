import { EnvironmentConfig } from '../../domain/models/EnvironmentConfig';
import EnvironmentRepository from '../../domain/repositories/EnvironmentRepository';

export class InMemoryEnvironmentRepository implements EnvironmentRepository {
  private map: Map<string, EnvironmentConfig> = new Map();

  async save(env: EnvironmentConfig): Promise<void> {
    this.map.set(env.id, env);
  }

  async getById(id: string): Promise<EnvironmentConfig | null> {
    return this.map.get(id) || null;
  }

  async listBySpec(specId: string): Promise<EnvironmentConfig[]> {
    return Array.from(this.map.values()).filter(e => e.specId === specId);
  }

  async delete(id: string): Promise<void> {
    this.map.delete(id);
  }
}

export default InMemoryEnvironmentRepository;
