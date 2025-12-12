"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOG_LEVEL = exports.PORT = exports.NODE_ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const env = process.env.NODE_ENV || 'development';
const envFile = `.env${env === 'development' ? '.development' : env === 'production' ? '.production' : env === 'test' ? '.test' : ''}`;
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), envFile) });
exports.NODE_ENV = process.env.NODE_ENV || 'development';
exports.PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
exports.LOG_LEVEL = process.env.LOG_LEVEL || 'info';
exports.default = { NODE_ENV: exports.NODE_ENV, PORT: exports.PORT, LOG_LEVEL: exports.LOG_LEVEL };
