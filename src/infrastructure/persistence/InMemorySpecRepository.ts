import { NormalizedSpec } from '../../domain/models/NormalizedSpec';
import SpecRepository from '../../domain/repositories/SpecRepository';

export class InMemorySpecRepository implements SpecRepository {
  private map: Map<string, NormalizedSpec> = new Map();

  async save(spec: NormalizedSpec): Promise<void> {
    this.map.set(spec.id, spec);
  }

  async getById(id: string): Promise<NormalizedSpec | null> {
    return this.map.get(id) || null;
  }

  async list(): Promise<NormalizedSpec[]> {
    return Array.from(this.map.values());
  }
}

export default InMemorySpecRepository;
