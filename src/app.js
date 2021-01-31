require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const {connectToDatabase} = require("./db");

const getRestaurantsRouter = require('./routes/getRestaurantsList');

const app = express();

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use('/api/v1/restaurants', getRestaurantsRouter);

connectToDatabase()

module.exports = {app}
