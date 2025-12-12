import axios, { AxiosRequestConfig } from 'axios';

type ExecResult = {
  httpStatus?: number;
  request?: any;
  response?: any;
  durationMs?: number;
};

function buildUrl(base: string, path: string, pathParams?: Record<string, any>, query?: Record<string, any>) {
  let url = (base || '').replace(/\/$/, '') + path;
  if (pathParams) {
    Object.keys(pathParams).forEach((k) => {
      url = url.replace(new RegExp(`\\{${k}\\}`, 'g'), encodeURIComponent(String(pathParams[k])));
    });
  }
  // append query
  if (query && Object.keys(query).length > 0) {
    const qs = Object.keys(query).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(String(query[k]))}`).join('&');
    url += (url.includes('?') ? '&' : '?') + qs;
  }
  return url;
}

export async function executeOperation(spec: any, operation: any, env: any, overrides?: any): Promise<ExecResult> {
  const start = Date.now();
  try {
    const pathParams = (overrides && overrides.pathParams) || {};
    const query = (overrides && overrides.query) || {};
    const headers = Object.assign({}, env?.defaultHeaders || {}, overrides?.headers || {});
    const body = overrides?.body || null;

    const url = buildUrl(env.baseUrl || '', operation.path, pathParams, query);

    const config: AxiosRequestConfig = {
      url,
      method: (operation.method || 'GET').toLowerCase() as any,
      headers,
      data: body,
      validateStatus: () => true,
      timeout: 15000,
    };

    const resp = await axios.request(config);
    const durationMs = Date.now() - start;

    return {
      httpStatus: resp.status,
      request: { url, method: config.method, headers, body },
      response: { status: resp.status, headers: resp.headers, data: resp.data },
      durationMs,
    };
  } catch (err: any) {
    const durationMs = Date.now() - start;
    return {
      httpStatus: err?.response?.status,
      request: null,
      response: null,
      durationMs,
    };
  }
}

export default { executeOperation };
