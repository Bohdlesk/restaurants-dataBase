import { Router } from 'express';

import { restaurantsRouter } from './restaurants';
import { reviewsRouter } from './review';

export const apiV1Router = Router();

apiV1Router.use('/restaurants', restaurantsRouter);
apiV1Router.use('/restaurants', reviewsRouter);
