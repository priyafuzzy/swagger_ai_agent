const fs = require('fs');
const path = require('path');
const http = require('http');
const yaml = require('js-yaml');

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node importSpecFromFile.js <path-to-yaml> [serverUrl]');
    process.exit(2);
  }
  const filePath = path.resolve(args[0]);
  const server = args[1] || 'http://localhost:3000';

  const content = fs.readFileSync(filePath, 'utf8');
  let parsed;
  try {
    parsed = yaml.load(content);
  } catch (err) {
    console.error('Failed to parse YAML:', err.message);
    process.exit(3);
  }

  const body = JSON.stringify({ raw: parsed });
  const url = new URL('/api/spec/import', server);
  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Response status:', res.statusCode);
      try { console.log(JSON.parse(data)); } catch (e) { console.log(data); }
    });
  });
  req.on('error', (err) => { console.error('Request error:', err.message); process.exit(4); });
  req.write(body);
  req.end();
}

main();
