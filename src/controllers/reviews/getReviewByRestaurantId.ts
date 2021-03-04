import { Request, Response } from 'express';
import Review from '../../models/review';

export default async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await Review.findOne({ where: { rest_id: req.params.id } });
    res.status(200).json({
      status: 'success',
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error,
    });
  }
};
