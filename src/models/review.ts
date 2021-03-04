/* eslint-disable camelcase */
import {
  DataTypes, Model,
} from 'sequelize';
import { db } from '../database';
import Restaurant from './restaurant';

export interface IReview {
  id?: number,
  rest_id: number,
  name: string,
  feedback_text: string,
  stars?: number,
}

class Review extends Model implements IReview {
  public id!: number;

  public rest_id!: number;

  public name!: string;

  public feedback_text!: string;

  public stars!: number;
}

Review.init({
  feedback_text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  rest_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Restaurant,
      key: 'id',
    },
  },
},
{
  sequelize: db,
  tableName: 'reviews',
  timestamps: false,
});

export default Review;
