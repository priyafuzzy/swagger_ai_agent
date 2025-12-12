"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const Logger_1 = __importDefault(require("../../infrastructure/logging/Logger"));
function requestLogger(req, res, next) {
    const { method, url } = req;
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        Logger_1.default.info(`${method} ${url} ${res.statusCode} - ${duration}ms`);
    });
    next();
}
