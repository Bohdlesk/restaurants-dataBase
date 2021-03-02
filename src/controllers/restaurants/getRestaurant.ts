import { Request, Response } from 'express';
import { Restaurant } from '../../models';

export default async (req: Request, res: Response): Promise<void> => {
  try {
    const id: number = parseInt(req.params.id as string, 10);
    const restaurant = await Restaurant.findOne({ where: { id } });
    if (restaurant) {
      res.status(200).json({
        status: 'success',
        restaurant,
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
