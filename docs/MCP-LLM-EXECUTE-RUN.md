# MCP / LLM and executeRun Options

This document explains configuration and runtime behaviour for MCP (compatibility clients), LLM payload builder, and `executeRun` options implemented in the project.

## MCP (Compatibility Client)

- Uses `src/infrastructure/mcp/FactoryAdapter.ts` which returns a `CompatibilityMcpClient` wrapping either `MockMCPAdapter` or `OpenAIAdapter`.
- Configure allowed tools via environment variable `MCP_ALLOWED_TOOLS` (comma-separated). Defaults to a conservative set. Use wildcards like `swagger.*` to allow groups.
- If no API key provided (`OPENAI_API_KEY` or `MCP_API_KEY`), the library falls back to `MockMCPAdapter` for safe local development and deterministic tests.
- Errors from remote LLM provider are normalized with helpful messages (OpenAI adapter adds HTTP status and response body when available).

## LLM Payload Builder

- `PayloadBuilderLlmClient` builds simple deterministic payloads from JSON-schema-like objects, and will call the MCP `text_generation` tool when deterministic output is incomplete.
- MCP responses that include a `success: false` flag are logged and treated as non-fatal; the builder will fall back to deterministic output.
- You may set `useMCP:false` to strictly use schema-only behavior.

## `executeRun` options

The `executeRun` use-case accepts an `options` object (passed from controller or direct API) with these keys:

- `retries` (number): number of retry attempts for a failing or erroring test (default 0).
- `retryFailedOnly` (boolean): when true and a `runId` is provided, preserve previously passed tests and only retry tests that failed or errored in the existing report.
- `partialTestIds` (string[]): restrict execution to a subset of tests from the run plan.

Usage examples (controller API):

POST `/api/execution/run` body examples:

- Run with one retry per test:

```json
{ "specId": "spec-1", "envName": "qa", "options": { "retries": 1 } }
```

- Retry only previously failed tests for an existing run:

```json
{ "runId": "run-abc", "options": { "retryFailedOnly": true, "retries": 2 } }
```

- Run only specific tests from a plan:

```json
{ "runId": "run-abc", "options": { "partialTestIds": ["tc-1","tc-5"] } }
```

## Next steps and recommendations

- For production usage, provide a real MCP/LLM adapter and set allowed tools carefully.
- Add circuit-breaker and rate-limit handling around LLM calls for robustness.
- Consider configurable timeouts for MCP calls via env or adapter config.

