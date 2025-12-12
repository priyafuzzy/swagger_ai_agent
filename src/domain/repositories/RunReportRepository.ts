import { RunReport } from '../models/RunReport';

export interface RunReportRepository {
  save(report: RunReport): Promise<void>;
  getByRunId(runId: string): Promise<RunReport | null>;
}

export default RunReportRepository;
