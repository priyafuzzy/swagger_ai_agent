"use strict";
/*
  Use `openapi-schema-validator` for full OpenAPI 3 validation.
  Falls back to a minimal AJV presence check if the validator cannot be loaded.
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSpec = validateSpec;
const ajv_1 = __importDefault(require("ajv"));
let OpenAPISchemaValidator = undefined;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    OpenAPISchemaValidator = require('openapi-schema-validator');
}
catch (err) {
    OpenAPISchemaValidator = undefined;
}
const ajv = new ajv_1.default({ allErrors: true, strict: false });
const openApiLiteSchema = {
    type: 'object',
    anyOf: [{ required: ['openapi'] }, { required: ['swagger'] }],
    properties: {
        info: {
            type: 'object',
            properties: { title: { type: 'string' } },
            required: ['title'],
        },
        paths: { type: 'object' },
    },
};
const validateFn = ajv.compile(openApiLiteSchema);
function validateSpec(raw) {
    try {
        // detect OpenAPI version if present
        let detectedVersion = undefined;
        if (raw && typeof raw === 'object') {
            if (raw.openapi && typeof raw.openapi === 'string')
                detectedVersion = raw.openapi;
            else if (raw.swagger && typeof raw.swagger === 'string')
                detectedVersion = raw.swagger;
        }
        if (OpenAPISchemaValidator) {
            const ValidatorClass = OpenAPISchemaValidator.default || OpenAPISchemaValidator;
            // prefer 3.1 if declared, else 3.x
            const majorVersion = detectedVersion && String(detectedVersion).startsWith('3.1') ? '3.1' : '3';
            const validator = new ValidatorClass({ version: majorVersion });
            const result = validator.validate(raw);
            if (!result || !result.errors || result.errors.length === 0)
                return { valid: true, details: { version: detectedVersion || null } };
            const errors = (result.errors || []).map((e) => {
                return {
                    message: e && (e.message || e.msg) ? (e.message || e.msg) : JSON.stringify(e),
                    path: e && e.path ? String(e.path) : undefined,
                    location: e && e.level ? String(e.level) : undefined,
                    raw: e,
                };
            });
            return { valid: false, errors, details: { version: detectedVersion || null, raw: result } };
        }
        // Fallback: lightweight AJV presence check
        const valid = validateFn(raw);
        if (valid)
            return { valid: true, details: { version: detectedVersion || null } };
        const errors = (validateFn.errors || []).map((e) => ({ message: `${e.instancePath} ${e.message}`, path: e.instancePath || undefined, raw: e }));
        return { valid: false, errors, details: validateFn.errors || undefined };
    }
    catch (e) {
        return { valid: false, errors: [{ message: String(e?.message || e), raw: e }], details: undefined };
    }
}
exports.default = { validateSpec };
