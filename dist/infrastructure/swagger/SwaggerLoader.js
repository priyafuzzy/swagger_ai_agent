"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchJsonFromUrl = fetchJsonFromUrl;
exports.loadFromFile = loadFromFile;
exports.loadFromGit = loadFromGit;
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const js_yaml_1 = __importDefault(require("js-yaml"));
// Fetch a URL and follow up to `maxRedirects` redirects. Returns parsed JSON/YAML when possible, otherwise returns the raw body string.
async function fetchJsonFromUrl(url, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        try {
            const visited = new Set();
            function doGet(targetUrl, redirectsLeft) {
                if (visited.has(targetUrl))
                    return reject(new Error('Redirect loop detected'));
                visited.add(targetUrl);
                const parsed = new URL(targetUrl);
                const client = parsed.protocol === 'https:' ? https_1.default : http_1.default;
                const opts = {
                    hostname: parsed.hostname,
                    port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
                    path: parsed.pathname + (parsed.search || ''),
                    headers: { 'User-Agent': 'swagger-ai-agent/1.0' },
                };
                const req = client.get(opts, (res) => {
                    const { statusCode, headers } = res;
                    // handle redirects (3xx)
                    if (statusCode && statusCode >= 300 && statusCode < 400 && headers && headers.location) {
                        if (redirectsLeft <= 0)
                            return reject(new Error('Too many redirects'));
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
                    res.on('data', (chunk) => raw += chunk);
                    res.on('end', () => {
                        // Try JSON first, then YAML fallback
                        try {
                            const parsedJson = JSON.parse(raw);
                            resolve(parsedJson);
                            return;
                        }
                        catch (err) {
                            try {
                                const doc = js_yaml_1.default.load(raw);
                                resolve(doc);
                                return;
                            }
                            catch (yerr) {
                                // last resort, return raw string
                                resolve(raw);
                                return;
                            }
                        }
                    });
                });
                req.on('error', (err) => reject(err));
            }
            doGet(url, maxRedirects);
        }
        catch (err) {
            reject(err);
        }
    });
}
async function loadFromFile(path) {
    const raw = fs_1.default.readFileSync(path, 'utf8');
    try {
        return JSON.parse(raw);
    }
    catch (e) {
        // try yaml
        return js_yaml_1.default.load(raw);
    }
}
async function loadFromGit(opts) {
    // Stub: implement git clone and read file in the future.
    // For now, throw a not-implemented error to surface to callers.
    throw new Error('loadFromGit not implemented');
}
exports.default = { fetchJsonFromUrl, loadFromFile, loadFromGit };
