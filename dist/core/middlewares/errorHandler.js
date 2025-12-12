"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const Logger_1 = __importDefault(require("../../infrastructure/logging/Logger"));
function errorHandler(err, req, res, next) {
    Logger_1.default.error(err && err.stack ? err.stack : String(err));
    const status = err && err.status ? err.status : 500;
    res.status(status).json({ error: err && err.message ? err.message : 'Internal Server Error' });
}
