import { Router } from 'express';

import { restaurantsRouter } from './restaurants';

export const apiV1Router = Router();

apiV1Router.use('/restaurants', restaurantsRouter);
