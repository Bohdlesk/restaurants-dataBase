const express = require('express');
const {getRestaurantById} = require("../dataBase/restaurantsQueryes");

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const queryResult = await getRestaurantById(restaurantId)
        res.status(200).json({
            status: 'success',
            restaurant: queryResult.rows[0]
        });
    } catch (error) {
        res.status(404).json({
            status: 'error',
        });
    }
});

module.exports = router;