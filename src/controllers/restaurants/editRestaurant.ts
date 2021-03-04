import { Request, Response } from 'express';
import { Restaurant } from '../../models';

export default async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedRestaurant = await Restaurant.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });

    if (updatedRestaurant[0]) {
      res.status(200).json({
        status: 'success',
        restaurant: updatedRestaurant[1][0],
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
