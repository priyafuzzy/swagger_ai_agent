"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./env");
const Logger_1 = __importDefault(require("../infrastructure/logging/Logger"));
const port = env_1.PORT || 3000;
app_1.default.listen(port, () => {
    Logger_1.default.info(`Swagger AI Agent listening on port ${port}`);
});
