require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const {connectToDatabase} = require("./db");

const getRestaurantsRouter = require('./routes/getRestaurantsList');
const getRestaurantByIdRouter = require('./routes/getRestaurantById');
const createRestaurantRouter = require('./routes/createRestaurant');
const deleteRestaurantRouter = require('./routes/deleteRestaurant');

const app = express();

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use('/api/v1/restaurants', getRestaurantsRouter);
app.use('/api/v1/restaurants', getRestaurantByIdRouter);
app.use('/api/v1/restaurants', createRestaurantRouter);
app.use('/api/v1/restaurants', deleteRestaurantRouter);


connectToDatabase();

module.exports = {app}
