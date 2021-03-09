import dotenv from 'dotenv';

dotenv.config();

export interface ProcessEnv {
  [key: string]: string | undefined
}

declare let process: {
  env: {
    DATABASE_URL: string,
    AWS_ACCESS_KEY_ID: string,
    AWS_SECRET_ACCESS_KEY: string,
  }
};

export const connectionString = process.env.DATABASE_URL;
export const awsConstants = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'eu-central-1',
};
