"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const env_1 = require("../../core/env");
const logger = (0, winston_1.createLogger)({
    level: env_1.LOG_LEVEL || 'info',
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.simple()),
    transports: [new winston_1.transports.Console()],
});
exports.default = logger;
