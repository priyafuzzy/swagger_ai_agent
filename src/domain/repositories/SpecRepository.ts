import { NormalizedSpec } from '../models/NormalizedSpec';

export interface SpecRepository {
  save(spec: NormalizedSpec): Promise<void>;
  getById(id: string): Promise<NormalizedSpec | null>;
  list(): Promise<NormalizedSpec[]>;
}

export default SpecRepository;
