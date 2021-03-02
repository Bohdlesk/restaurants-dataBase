import { Router } from 'express';

import * as controllers from '../controllers/restaurants';
import * as middleware from '../middleweares';

export const restaurantsRouter = Router();

restaurantsRouter.post('/', middleware.upload.single('image'), controllers.createRestaurant);
restaurantsRouter.get('/', controllers.getRestaurantsList);
restaurantsRouter.delete('/:id', controllers.deleteRestaurnt);
