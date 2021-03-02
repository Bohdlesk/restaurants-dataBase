import { Sequelize } from 'sequelize';
import { connectionString } from './constants';

// create database client
export const db = new Sequelize(
  connectionString,
  {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: process.env.NODE_ENV === 'production'
      ? false
      : console.log,
  },
);
export async function connectToDataBase(): Promise<void> {
  try {
    await db.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
