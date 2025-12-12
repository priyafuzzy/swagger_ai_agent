import InMemorySpecRepository from './InMemorySpecRepository';
import InMemoryEnvironmentRepository from './InMemoryEnvironmentRepository';
import InMemoryRunPlanRepository from './InMemoryRunPlanRepository';
import InMemoryRunReportRepository from './InMemoryRunReportRepository';

export const specRepository = new InMemorySpecRepository();
export const environmentRepository = new InMemoryEnvironmentRepository();
export const runPlanRepository = new InMemoryRunPlanRepository();
export const runReportRepository = new InMemoryRunReportRepository();

export default {
  specRepository,
  environmentRepository,
  runPlanRepository,
  runReportRepository,
};
