"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function loadConfig() {
    const configDir = path_1.default.resolve(process.cwd(), 'config');
    const env = process.env.NODE_ENV || 'development';
    const base = {};
    try {
        const defaultPath = path_1.default.join(configDir, 'default.ts');
        if (fs_1.default.existsSync(defaultPath)) {
            // load via require to allow ts-node in dev; keep minimal here
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const def = require(defaultPath).default || require(defaultPath);
            Object.assign(base, def);
        }
    }
    catch (e) {
        // ignore missing default
    }
    try {
        const envPath = path_1.default.join(configDir, `${env}.ts`);
        if (fs_1.default.existsSync(envPath)) {
            const envCfg = require(envPath).default || require(envPath);
            Object.assign(base, envCfg);
        }
    }
    catch (e) {
        // ignore
    }
    return base;
}
const config = loadConfig();
exports.default = config;
