import fs from 'fs';
import path from 'path';

type Config = Record<string, any>;

function loadConfig(): Config {
  const configDir = path.resolve(process.cwd(), 'config');
  const env = process.env.NODE_ENV || 'development';
  const base: Config = {};

  try {
    const defaultPath = path.join(configDir, 'default.ts');
    if (fs.existsSync(defaultPath)) {
      // load via require to allow ts-node in dev; keep minimal here
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const def = require(defaultPath).default || require(defaultPath);
      Object.assign(base, def);
    }
  } catch (e) {
    // ignore missing default
  }

  try {
    const envPath = path.join(configDir, `${env}.ts`);
    if (fs.existsSync(envPath)) {
      const envCfg = require(envPath).default || require(envPath);
      Object.assign(base, envCfg);
    }
  } catch (e) {
    // ignore
  }

  return base;
}

const config = loadConfig();

export default config;
