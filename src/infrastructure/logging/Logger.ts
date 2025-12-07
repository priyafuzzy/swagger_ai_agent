import { createLogger, format, transports } from 'winston';
import { LOG_LEVEL } from '../../core/env';

const logger = createLogger({
  level: LOG_LEVEL || 'info',
  format: format.combine(format.timestamp(), format.simple()),
  transports: [new transports.Console()],
});

export default logger;
