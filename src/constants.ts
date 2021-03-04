import dotenv from 'dotenv';

dotenv.config();

declare let process: {
  env: {
    DATABASE_URL: string
  }
};

export const connectionString = process.env.DATABASE_URL;
