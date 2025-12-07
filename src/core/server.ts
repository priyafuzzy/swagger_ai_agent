import app from './app';
import { PORT } from './env';
import logger from '../infrastructure/logging/Logger';

const port = PORT || 3000;

app.listen(port, () => {
  logger.info(`Swagger AI Agent listening on port ${port}`);
});
