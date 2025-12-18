const axios = require('axios');
(async()=>{
  try {
    const r = await axios.get('http://localhost:3000/health', { timeout: 5000 });
    console.log('OK', r.data);
  } catch (err) {
    console.error('ERR', err && err.message);
    if (err && err.response) console.error('RESP', err.response.status, err.response.data);
    if (err && err.stack) console.error(err.stack);
    process.exit(1);
  }
})();
