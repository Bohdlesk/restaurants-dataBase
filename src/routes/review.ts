import { Router } from 'express';

import * as controllers from '../controllers/reviews';

export const reviewsRouter = Router();

reviewsRouter.post('/:id/reviews', controllers.createReview);

reviewsRouter.get('/:id/reviews', controllers.getReviewByRestaurantId);
