const axios = require('axios');

(async () => {
  try {
    console.log('Starting full run smoke test...');
    const importResp = await axios.post('http://localhost:3000/api/spec/import', {
      source: { type: 'url', url: 'https://petstore.swagger.io/v2/swagger.json' }
    }, { timeout: 30000 });
    console.log('Imported:', importResp.data);

    const specId = importResp.data && importResp.data.specId;
    if (!specId) throw new Error('specId not returned');

    await axios.post('http://localhost:3000/api/environment', {
      specId,
      name: 'qa',
      baseUrl: 'https://petstore.swagger.io',
      defaultHeaders: {},
      auth: {}
    });

    const planResp = await axios.post('http://localhost:3000/api/execution/plan', {
      specId,
      envName: 'qa',
      selection: { mode: 'full' }
    });
    console.log('Plan:', planResp.data);

    const runResp = await axios.post('http://localhost:3000/api/execution/run', {
      specId,
      envName: 'qa',
      options: { retries: 1 }
    }, { timeout: 60000 });
    console.log('Run report:', runResp.data);
  } catch (err) {
    console.error('ERROR:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
