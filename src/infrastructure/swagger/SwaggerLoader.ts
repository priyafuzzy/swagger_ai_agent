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
  // Support simple GitHub repo references by fetching the raw file from
  // raw.githubusercontent.com. `opts.repo` may be either a "owner/repo"
  // string or a github.com URL. We try the supplied ref, then fall back
  // to common default branches ('main', 'master').
  const repo = opts.repo || '';
  const filePath = opts.filePath;
  const tryRefs = [] as string[];
  if (opts.ref) tryRefs.push(opts.ref);
  tryRefs.push('main', 'master');

  // normalize repo input to owner/repo
  let ownerRepo = repo;
  try {
    if (repo.includes('github.com')) {
      // strip protocol and domain, get path segments
      const url = new URL(repo);
      ownerRepo = url.pathname.replace(/(^\/+|\.git$)/g, '').replace(/\/$/, '');
      // remove leading slash
      if (ownerRepo.startsWith('/')) ownerRepo = ownerRepo.slice(1);
    }
    // strip .git suffix if present and any trailing slashes
    ownerRepo = ownerRepo.replace(/\.git$/i, '').replace(/\/$/, '');
  } catch (err) {
    // fallback: keep original repo string
    ownerRepo = repo;
  }

  // ensure owner/repo format
  if (!ownerRepo || ownerRepo.split('/').length < 2) {
    throw new Error('Invalid repo format for loadFromGit, expected "owner/repo" or full GitHub URL');
  }

  // attempt to fetch the raw file for each candidate ref
  let lastErr: any = null;
  for (const ref of tryRefs) {
    const rawUrl = `https://raw.githubusercontent.com/${ownerRepo}/${ref}/${filePath}`;
    try {
      // call via exported symbol so tests can spy/mock it
      const loader: any = (exports as any);
      const res = await loader.fetchJsonFromUrl ? await loader.fetchJsonFromUrl(rawUrl) : await fetchJsonFromUrl(rawUrl);
      return res;
    } catch (err) {
      lastErr = err;
      // try next ref
    }
  }

  throw new Error(`Failed to load file from git for ${ownerRepo}/${filePath}: ${lastErr && lastErr.message ? lastErr.message : lastErr}`);
}

export default { fetchJsonFromUrl, loadFromFile, loadFromGit };
