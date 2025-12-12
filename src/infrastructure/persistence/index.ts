import InMemorySpecRepository from './InMemorySpecRepository';
import InMemoryEnvironmentRepository from './InMemoryEnvironmentRepository';
import InMemoryRunPlanRepository from './InMemoryRunPlanRepository';

export const specRepository = new InMemorySpecRepository();
export const environmentRepository = new InMemoryEnvironmentRepository();
export const runPlanRepository = new InMemoryRunPlanRepository();

export default {
  specRepository,
  environmentRepository,
  runPlanRepository,
};
