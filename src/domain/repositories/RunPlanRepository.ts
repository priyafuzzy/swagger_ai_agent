import { RunPlan } from '../models/RunPlan';

export interface RunPlanRepository {
  save(plan: RunPlan): Promise<void>;
  getById(runId: string): Promise<RunPlan | null>;
  list(): Promise<RunPlan[]>;
}

export default RunPlanRepository;
