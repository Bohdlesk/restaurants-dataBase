import express from 'express';
import cors from 'cors';

import { connectToDataBase } from './database';
import { apiV1Router } from './routes';
import * as logger from './middleweares/logger';

export const app = express();

// CORS options
const corsOptions = {
  origin: 'https://restaurantpetproject.netlify.app',
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(cors());

app.get('/', (req: express.Request, res: express.Response) => {
  console.log('test');
  res.send('hi');
});

app.use(logger.errorLogger);
app.use(logger.requestLogger);
app.use('/api/v1', apiV1Router);

// connection to data base
connectToDataBase();
