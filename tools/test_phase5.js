const axios = require('axios');

(async () => {
  try {
    const health = await axios.get('http://localhost:3000/health');
    console.log('HEALTH:', health.data);

    const importResp = await axios.post('http://localhost:3000/spec/import', {
      source: { type: 'url', url: 'https://petstore.swagger.io/v2/swagger.json' }
    }, { timeout: 30000 });
    console.log('IMPORT_RESPONSE:', importResp.data);

    let specId = null;
    if (importResp.data) {
      specId = importResp.data.specId || (importResp.data.result && importResp.data.result.data && importResp.data.result.data.id) || (importResp.data.result && importResp.data.result.specId) || null;
    }
    console.log('SPEC_ID:', specId);

    if (specId) {
      const envResp = await axios.post('http://localhost:3000/environment', {
        specId,
        name: 'qa',
        baseUrl: 'https://petstore.swagger.io',
        defaultHeaders: {},
        authConfig: {}
      });
      console.log('CREATE_ENV_RESPONSE:', envResp.data);

      const listResp = await axios.get(`http://localhost:3000/spec/${specId}/environments`);
      console.log('LIST_ENVS_RESPONSE:', listResp.data);
    } else {
      console.log('No specId found; skipping environment creation.');
    }
  } catch (err) {
    if (err.response) {
      console.error('ERROR_RESPONSE:', err.response.status, err.response.data);
    } else {
      console.error('ERROR:', err.message);
    }
    process.exit(1);
  }
})();
