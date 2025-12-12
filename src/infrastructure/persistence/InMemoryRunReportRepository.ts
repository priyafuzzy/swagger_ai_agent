import { RunReport } from '../../domain/models/RunReport';
import RunReportRepository from '../../domain/repositories/RunReportRepository';

export class InMemoryRunReportRepository implements RunReportRepository {
  private map: Map<string, RunReport> = new Map();

  async save(report: RunReport): Promise<void> {
    this.map.set(report.runId, report);
  }

  async getByRunId(runId: string): Promise<RunReport | null> {
    return this.map.get(runId) || null;
  }
}

export default InMemoryRunReportRepository;
