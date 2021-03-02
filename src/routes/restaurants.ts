import { Router } from 'express';

import * as controllers from '../controllers/restaurants';
import * as middleware from '../middleweares';

export const restaurantsRouter = Router();

restaurantsRouter.post('/', middleware.upload.single('image'), controllers.createRestaurant);
restaurantsRouter.delete('/:id', controllers.deleteRestaurant);
restaurantsRouter.get('/:id', controllers.getRestaurant);
restaurantsRouter.get('/', controllers.getRestaurantsList);
