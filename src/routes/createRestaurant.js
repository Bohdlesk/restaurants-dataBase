const express = require('express');

const {
    createRestaurant,
    searchRestaurantByNameAndLocation
} = require("../dataBase/restaurantsQueryes");

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        priceRangeCheck(req)
        const isFound = await searchRestaurantByNameAndLocation(req.body)
        if (isFound.rows.length !== 0) {
            throw new Error(`Restaurant ${req.body.name} in ${req.body.location} is already exists`)
        }
        const createdRestaurant = await createRestaurant(req)
        res.status(200).json({
            status: 'success',
            restaurant: createdRestaurant.rows[0]
        })
    } catch (error) {
        res.status(404).json({
            message: error.message,
            error
        });
    }
});

function priceRangeCheck(request) {
    if ((request.body.price_range < 1) || (request.body.price_range > 5)) {
        throw new Error('Wrong price range value')
    }
}

module.exports = router;