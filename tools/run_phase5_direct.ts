import { ingestSwagger } from '../src/application/spec/ingestSwagger.usecase';
import { specRepository, environmentRepository } from '../src/infrastructure/persistence';

(async () => {
  try {
    const spec = await ingestSwagger({ source: { type: 'url', url: 'https://petstore.swagger.io/v2/swagger.json' } });
    console.log('Imported spec id:', spec.id, 'title:', spec.title, 'ops:', spec.operationCount);

    const env: any = {
      id: 'env-' + Date.now().toString(36),
      specId: spec.id,
      name: 'qa',
      baseUrl: 'https://petstore.swagger.io',
      defaultHeaders: {},
      authConfig: {},
    };
    await environmentRepository.save(env);
    console.log('Created env id:', env.id);

    const envs = await environmentRepository.listBySpec(spec.id);
    console.log('Environments for spec:', envs);
  } catch (err) {
    console.error('ERROR:', err && (err as any).stack ? (err as any).stack : err);
    process.exit(1);
  }
})();
