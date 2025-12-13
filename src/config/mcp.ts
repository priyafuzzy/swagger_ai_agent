const DEFAULT_ALLOWED_TOOLS = [
  'text_generation',
  'listOperations',
  'planRun',
  'executeOperation',
  'generateAxiosTests',
];

const raw = process.env.MCP_ALLOWED_TOOLS;
const allowedTools = raw && raw.length ? raw.split(',').map(s => s.trim()).filter(Boolean) : DEFAULT_ALLOWED_TOOLS;

export default {
  allowedTools,
};
