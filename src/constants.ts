import dotenv from 'dotenv';

dotenv.config();

declare let process: {
  env: {
    DATABASE_URL: string
  }
};

// export const {AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, PGHOST, AWS_LINK_FOR_SERVER} = process.env;

export const connectionString = process.env.DATABASE_URL;
