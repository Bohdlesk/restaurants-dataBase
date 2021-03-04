import { Request, Response } from 'express';
import { QueryOptions } from 'sequelize';
import Review from '../../models/review';

export default async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(req.params);
    const params: QueryOptions = {
      rest_id: req.params.id,
      ...req.body,
    };
    console.log(params);
    const review = await Review.create(params);
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
