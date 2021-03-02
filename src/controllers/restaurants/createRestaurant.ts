import { Request, Response } from 'express';
import { Restaurant } from '../../models';

export default async (req: Request, res: Response): Promise<void> => {
  try {
    const findRestaurant = await Restaurant.findOne({
      where: {
        name: req.body.name,
        location: req.body.location,
      },
    });
    if (findRestaurant) {
      res.status(404).json({
        status: 'error',
        message: 'Restaurant is already exist',
      });
    } else {
      const restaurant = await Restaurant.create(req.body);
      res.status(200).json({
        status: 'success',
        restaurant,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error,
    });
  }
};
