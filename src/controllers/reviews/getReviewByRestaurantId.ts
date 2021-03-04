import { Request, Response } from 'express';
import Review from '../../models/review';

export default async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await Review.findOne({ where: { rest_id: req.params.id } });
    if (review) {
      res.status(200).json({
        status: 'success',
        review,
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error,
    });
  }
};
