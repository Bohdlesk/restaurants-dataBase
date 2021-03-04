/* eslint-disable camelcase */
import {
  DataTypes, Model,
} from 'sequelize';
import { db } from '../database';

export interface IRestaurant {
  id?: number,
  name: string,
  location: string,
  price_range: number,
  reviews_quantity?: number,
  rating?: number,
  website?: string | null,
  image_link?: string | null,
}

class Restaurant extends Model implements IRestaurant {
  public id!: number;

  public name!: string;

  public location!: string;

  public price_range!: number;

  public reviews_quantity!: number;

  public rating!: number;

  public website!: string | null;

  public image_link!: string | null;
}

Restaurant.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price_range: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reviews_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  website: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image_link: {
    type: DataTypes.STRING,
  },
},
{
  sequelize: db,
  tableName: 'restaurants',
  timestamps: false,
});

export default Restaurant;
