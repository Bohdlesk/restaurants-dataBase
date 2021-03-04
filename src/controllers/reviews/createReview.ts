import { Request, Response } from 'express';
import { QueryOptions } from 'sequelize';
import Review from '../../models/review';
import { Restaurant } from '../../models';

export default async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(req.params);
    const params: QueryOptions = {
      rest_id: req.params.id,
      ...req.body,
    };
    console.log(params);
    const restaurant: Restaurant | null = await Restaurant.findOne({
      where: { id: req.params.id },
    });

    if (restaurant) {
      const { stars } = req.body;
      const restaurantRating: number = restaurant.rating;
      const reviewsAmount: number = restaurant.reviews_quantity;

      const newRating = (reviewsAmount * restaurantRating + stars) / (reviewsAmount + 1);

      await Restaurant.update({
        rating: newRating,
        reviews_quantity: reviewsAmount + 1,
      },
      { where: { id: req.params.id } });

      const review = await Review.create(params);
      res.status(200).json({
        status: 'success',
        review,
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Restaurant does not exist',
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error,
    });
  }
};
