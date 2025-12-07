import dotenv from 'dotenv';
import path from 'path';

const env = process.env.NODE_ENV || 'development';
const envFile = `.env${env === 'development' ? '.development' : env === 'production' ? '.production' : env === 'test' ? '.test' : ''}`;

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

export default { NODE_ENV, PORT, LOG_LEVEL };
