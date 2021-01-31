const express = require('express');

const {getRestaurantsList} = require("../dataBase/restaurantsQueryes");

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        let typeOfSort = req.query.order;
        let paramOfSort = req.query.name || 'id';

        if (typeOfSort === '[]asc') typeOfSort = 'ASC';
        else typeOfSort = 'DESC';

        const restaurantsList = await getRestaurantsList(paramOfSort, typeOfSort);
        res.status(200).json({
            status: 'success',
            restaurants: restaurantsList
        });
    } catch (error) {
        res.status(404).json({
            status: 'error',
        });
    }
});

module.exports = router;