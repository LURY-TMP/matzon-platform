import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  postgresUrl: process.env.DATABASE_URL,
  mongoUri: process.env.MONGODB_URI,
}));
