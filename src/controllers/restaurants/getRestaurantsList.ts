import { Request, Response } from 'express';
import { FindOptions } from 'sequelize';
import { Restaurant } from '../../models';

export default async (req: Request, res: Response): Promise<void> => {
  try {
    let sortType = 'DESC';
    let sortParam = 'id';
    if (req.query.order === '[]asc') sortType = 'ASC';
    if (typeof req.query.name === 'string') sortParam = req.query.name;
    const params: FindOptions = {
      order: [[sortParam, sortType]],
    };
    const restaurantsList = await Restaurant.findAll(params);
    res.status(200).json({
      status: 'success',
      restaurants: restaurantsList,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error,
    });
  }
};
