import fs from 'fs';
import http from 'http';
import https from 'https';
import yaml from 'js-yaml';

// Fetch a URL and follow up to `maxRedirects` redirects. Returns parsed JSON/YAML when possible, otherwise returns the raw body string.
export async function fetchJsonFromUrl(url: string, maxRedirects = 5): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const visited = new Set<string>();

      function doGet(targetUrl: string, redirectsLeft: number) {
        if (visited.has(targetUrl)) return reject(new Error('Redirect loop detected'));
        visited.add(targetUrl);

        const parsed = new URL(targetUrl);
        const client = parsed.protocol === 'https:' ? https : http;

        const opts: any = {
          hostname: parsed.hostname,
          port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
          path: parsed.pathname + (parsed.search || ''),
          headers: { 'User-Agent': 'swagger-ai-agent/1.0' },
        };

        const req = client.get(opts, (res: any) => {
          const { statusCode, headers } = res;

          // handle redirects (3xx)
          if (statusCode && statusCode >= 300 && statusCode < 400 && headers && headers.location) {
            if (redirectsLeft <= 0) return reject(new Error('Too many redirects'));
            const next = new URL(headers.location, targetUrl).toString();
            // follow redirect
            res.resume();
            return doGet(next, redirectsLeft - 1);
          }

          if (statusCode && statusCode >= 400) {
            reject(new Error(`Request failed with status ${statusCode}`));
            res.resume();
            return;
          }

          let raw = '';
          res.setEncoding('utf8');
          res.on('data', (chunk: string) => raw += chunk);
          res.on('end', () => {
            // Try JSON first, then YAML fallback
            try {
              const parsedJson = JSON.parse(raw);
              resolve(parsedJson);
              return;
            } catch (err) {
              try {
                const doc = yaml.load(raw);
                resolve(doc);
                return;
              } catch (yerr) {
                // last resort, return raw string
                resolve(raw);
                return;
              }
            }
          });
        });

        req.on('error', (err: any) => reject(err));
      }

      doGet(url, maxRedirects);
    } catch (err) {
      reject(err);
    }
  });
}

export async function loadFromFile(path: string): Promise<any> {
  const raw = fs.readFileSync(path, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    // try yaml
    return yaml.load(raw);
  }
}

export async function loadFromGit(opts: { repo: string; ref?: string; filePath: string }): Promise<any> {
  // Stub: implement git clone and read file in the future.
  // For now, throw a not-implemented error to surface to callers.
  throw new Error('loadFromGit not implemented');
}

export default { fetchJsonFromUrl, loadFromFile, loadFromGit };
