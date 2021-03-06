import { Request, Response } from 'express';
import { Restaurant } from '../../models';
import Review from '../../models/review';

export default async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Review.destroy({ where: { rest_id: id } });
    const isDeleted = await Restaurant.destroy({ where: { id } });
    if (isDeleted) {
      res.status(200).json({
        status: 'success',
        info: `Restaurant with id=${id} has been deleted`,
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
