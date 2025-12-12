import { RunPlan } from '../../domain/models/RunPlan';
import RunPlanRepository from '../../domain/repositories/RunPlanRepository';

export class InMemoryRunPlanRepository implements RunPlanRepository {
  private map: Map<string, RunPlan> = new Map();

  async save(plan: RunPlan): Promise<void> {
    this.map.set(plan.runId, plan);
  }

  async getById(runId: string): Promise<RunPlan | null> {
    return this.map.get(runId) || null;
  }

  async list(): Promise<RunPlan[]> {
    return Array.from(this.map.values());
  }
}

export default InMemoryRunPlanRepository;
